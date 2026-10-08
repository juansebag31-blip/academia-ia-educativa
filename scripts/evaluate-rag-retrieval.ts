import fs from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import {
  DEFAULT_EMBEDDING_BATCH_SIZE,
  embedRagQueriesInBatches,
  safeErrorSummary,
} from "../src/lib/rag/batching";
import type { RagCorpusFile } from "../src/lib/rag/corpus";
import { RAG_RETRIEVAL_EVALUATION_CASES } from "../src/lib/rag/evaluation-cases";
import { evaluateRagCase, summarizeRagEvaluation } from "../src/lib/rag/evaluation";
import { GeminiRagEmbeddingProvider } from "../src/lib/rag/gemini-embedding-provider";
import { loadRagIndexState } from "../src/lib/rag/indexing";
import { createRagAdminClient } from "../src/lib/rag/persistence";
import { searchRagChunksByEmbedding } from "../src/lib/rag/retrieval";
import { requireRagSmokeEnvironment } from "../src/lib/rag/server-config";

const projectRoot = process.cwd();
const corpusPath = path.join(projectRoot, "content", "generated", "rag-chunks.json");
const outputPath = path.join(projectRoot, "content", "generated", "rag-retrieval-evaluation.json");
const topK = 8;

async function main() {
  loadEnvConfig(projectRoot);
  const config = requireRagSmokeEnvironment();
  const corpus = JSON.parse(await fs.readFile(corpusPath, "utf8")) as RagCorpusFile;
  const courseSlug = corpus.chunks[0]?.courseSlug;
  if (!courseSlug) throw new Error("El corpus no contiene courseSlug.");
  if (RAG_RETRIEVAL_EVALUATION_CASES.length < 30) {
    throw new Error("La batería de evaluación debe contener al menos 30 preguntas.");
  }

  const admin = createRagAdminClient();
  const provider = new GeminiRagEmbeddingProvider(config.geminiApiKey);
  const indexState = await loadRagIndexState(admin, courseSlug);
  if (indexState.chunks.length !== corpus.chunks.length) {
    throw new Error(
      `La evaluación requiere ${corpus.chunks.length} chunks indexados; se encontraron ${indexState.chunks.length}.`,
    );
  }

  let retryCount = 0;
  console.log(`[rag:evaluate] Generando embeddings para ${RAG_RETRIEVAL_EVALUATION_CASES.length} preguntas.`);
  const queryEmbeddings = await embedRagQueriesInBatches({
    provider,
    queries: RAG_RETRIEVAL_EVALUATION_CASES.map((testCase) => testCase.question),
    batchSize: DEFAULT_EMBEDDING_BATCH_SIZE,
    onBatchComplete: ({ batchIndex, batchCount, processedItems, totalItems }) => {
      console.log(`[rag:evaluate] Embeddings lote ${batchIndex + 1}/${batchCount}: ${processedItems}/${totalItems}.`);
    },
    onRetry: ({ attempt, delayMs, reason, batchIndex, batchCount }) => {
      retryCount += 1;
      console.warn(`[rag:evaluate] Reintento ${attempt} del lote ${batchIndex + 1}/${batchCount} en ${delayMs} ms: ${reason}`);
    },
  });

  const caseResults = [];
  for (const [index, testCase] of RAG_RETRIEVAL_EVALUATION_CASES.entries()) {
    const results = await searchRagChunksByEmbedding({
      admin,
      queryEmbedding: queryEmbeddings[index],
      courseSlug,
      matchCount: topK,
    });
    caseResults.push(evaluateRagCase(testCase, results));
    console.log(`[rag:evaluate] Retrieval ${index + 1}/${RAG_RETRIEVAL_EVALUATION_CASES.length}: ${testCase.id}.`);
  }

  const metrics = summarizeRagEvaluation(caseResults);
  const report = {
    generatedAt: new Date().toISOString(),
    corpusVersion: corpus.corpusVersion,
    chunkingVersion: corpus.chunkingVersion,
    courseSlug,
    model: provider.model,
    dimensions: provider.dimensions,
    indexedDocuments: indexState.documents.length,
    indexedChunks: indexState.chunks.length,
    topK,
    threshold: null,
    retries: retryCount,
    metrics,
    cases: caseResults,
  };

  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`[rag:evaluate] Informe: ${path.relative(projectRoot, outputPath)}.`);
  console.log(JSON.stringify(metrics, null, 2));
}

main().catch((error) => {
  console.error(`[rag:evaluate] ${safeErrorSummary(error)}`);
  process.exit(1);
});
