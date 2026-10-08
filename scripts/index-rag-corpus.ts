import fs from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import {
  DEFAULT_EMBEDDING_BATCH_SIZE,
  embedRagChunksInBatches,
  safeErrorSummary,
} from "../src/lib/rag/batching";
import type { RagCorpusFile } from "../src/lib/rag/corpus";
import { GeminiRagEmbeddingProvider } from "../src/lib/rag/gemini-embedding-provider";
import {
  deleteStaleRagRows,
  loadRagIndexState,
  staleRagDocumentIds,
  updateReusedRagChunkMetadata,
  upsertRagChunkEmbeddings,
  upsertRagDocuments,
} from "../src/lib/rag/indexing";
import {
  planRagIndexing,
  ragDocumentStableKey,
  verifyIndexedCorpus,
} from "../src/lib/rag/indexing-plan";
import { createRagAdminClient } from "../src/lib/rag/persistence";
import { requireRagSmokeEnvironment } from "../src/lib/rag/server-config";
import { selectRagSmokeChunks } from "../src/lib/rag/smoke-selection";

const projectRoot = process.cwd();
const corpusPath = path.join(projectRoot, "content", "generated", "rag-chunks.json");
const persistenceBatchSize = 8;

async function main() {
  loadEnvConfig(projectRoot);
  const config = requireRagSmokeEnvironment();
  const corpus = JSON.parse(await fs.readFile(corpusPath, "utf8")) as RagCorpusFile;
  if (corpus.chunks.length !== corpus.summary.chunks || corpus.chunks.length === 0) {
    throw new Error("El corpus RAG no coincide con su resumen o está vacío.");
  }

  const admin = createRagAdminClient();
  const provider = new GeminiRagEmbeddingProvider(config.geminiApiKey);
  const courseSlug = corpus.chunks[0]?.courseSlug;
  if (!courseSlug || corpus.chunks.some((chunk) => chunk.courseSlug !== courseSlug)) {
    throw new Error("El corpus debe contener un único courseSlug válido.");
  }

  const initial = await loadRagIndexState(admin, courseSlug);
  const plan = planRagIndexing(corpus.chunks, initial.chunks);
  const smokeHashes = new Set(selectRagSmokeChunks(corpus).map(({ chunk }) => chunk.contentSha256));
  const smokeChunksDetected = initial.chunks.filter((chunk) =>
    smokeHashes.has(chunk.content_sha256)).length;
  const needsEmbedding = plan.entries.filter((entry) => entry.action !== "reuse");
  let retryCount = 0;

  console.log(`[rag:index] Corpus: ${corpus.chunks.length} chunks en ${corpus.documents.length} documentos.`);
  console.log(`[rag:index] Estado remoto: ${initial.chunks.length} chunks; smoke detectados: ${smokeChunksDetected}/3.`);
  console.log(`[rag:index] Plan: crear ${plan.created}, reutilizar ${plan.reused}, actualizar ${plan.updated}, eliminar obsoletos ${plan.staleChunkIds.length}.`);

  const embeddings = await embedRagChunksInBatches({
    provider,
    chunks: needsEmbedding.map((entry) => entry.chunk),
    batchSize: DEFAULT_EMBEDDING_BATCH_SIZE,
    onBatchComplete: ({ batchIndex, batchCount, processedItems, totalItems }) => {
      console.log(`[rag:index] Embeddings lote ${batchIndex + 1}/${batchCount}: ${processedItems}/${totalItems}.`);
    },
    onRetry: ({ attempt, delayMs, reason, batchIndex, batchCount }) => {
      retryCount += 1;
      console.warn(`[rag:index] Reintento ${attempt} del lote ${batchIndex + 1}/${batchCount} en ${delayMs} ms: ${reason}`);
    },
  });

  if (embeddings.length !== needsEmbedding.length) {
    throw new Error("La cantidad de embeddings generados no coincide con el plan de indexación.");
  }

  const documentIds = await upsertRagDocuments(admin, corpus);
  const staleDocumentIds = staleRagDocumentIds(corpus, initial.documents);
  await deleteStaleRagRows(admin, {
    staleChunkIds: plan.staleChunkIds,
    staleDocumentIds,
  });

  const reusedMetadataUpdates = plan.entries.filter((entry) =>
    entry.action === "reuse"
    && entry.existing
    && (
      entry.metadataChanged
      || entry.existing.document_id !== documentIds.get(ragDocumentStableKey(entry.chunk))
    ));
  for (const [index, entry] of reusedMetadataUpdates.entries()) {
    const documentId = documentIds.get(ragDocumentStableKey(entry.chunk));
    if (!documentId || !entry.existing) {
      throw new Error(`No se encontró el documento de ${entry.chunk.sourceFile}.`);
    }
    await updateReusedRagChunkMetadata(admin, {
      id: entry.existing.id,
      chunk: entry.chunk,
      documentId,
    });
    if ((index + 1) % 25 === 0 || index + 1 === reusedMetadataUpdates.length) {
      console.log(`[rag:index] Metadata reutilizada actualizada: ${index + 1}/${reusedMetadataUpdates.length}.`);
    }
  }

  for (let index = 0; index < needsEmbedding.length; index += persistenceBatchSize) {
    const batchEntries = needsEmbedding.slice(index, index + persistenceBatchSize);
    const batchEmbeddings = embeddings.slice(index, index + persistenceBatchSize);
    await upsertRagChunkEmbeddings(admin, batchEntries.map((entry, batchIndex) => {
      const documentId = documentIds.get(ragDocumentStableKey(entry.chunk));
      if (!documentId) throw new Error(`No se encontró el documento de ${entry.chunk.sourceFile}.`);
      return {
        chunk: entry.chunk,
        documentId,
        embedding: batchEmbeddings[batchIndex],
      };
    }));
    console.log(`[rag:index] Persistencia: ${Math.min(index + persistenceBatchSize, needsEmbedding.length)}/${needsEmbedding.length}.`);
  }

  const finalState = await loadRagIndexState(admin, courseSlug);
  const verificationErrors = verifyIndexedCorpus(corpus.chunks, finalState.chunks);
  const expectedDocuments = new Set(corpus.chunks.map(ragDocumentStableKey)).size;
  if (finalState.documents.length !== expectedDocuments) {
    verificationErrors.push(
      `Se esperaban ${expectedDocuments} documentos y se encontraron ${finalState.documents.length}.`,
    );
  }
  if (verificationErrors.length > 0) {
    throw new Error(`La verificación final falló:\n${verificationErrors.join("\n")}`);
  }

  console.log(JSON.stringify({
    courseSlug,
    corpusVersion: corpus.corpusVersion,
    chunkingVersion: corpus.chunkingVersion,
    model: provider.model,
    dimensions: provider.dimensions,
    documentsIndexed: finalState.documents.length,
    chunksIndexed: finalState.chunks.length,
    embeddingsCreated: plan.created,
    embeddingsReused: plan.reused,
    embeddingsUpdated: plan.updated,
    staleChunksDeleted: plan.staleChunkIds.length,
    staleDocumentsDeleted: staleDocumentIds.length,
    reusedMetadataUpdated: reusedMetadataUpdates.length,
    smokeChunksDetected,
    retries: retryCount,
    errors: 0,
  }, null, 2));
}

main().catch((error) => {
  console.error(`[rag:index] ${safeErrorSummary(error)}`);
  process.exit(1);
});
