import fs from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { RagCorpusFile } from "../src/lib/rag/corpus";
import { embedRagChunk } from "../src/lib/rag/embedding-provider";
import { GeminiRagEmbeddingProvider } from "../src/lib/rag/gemini-embedding-provider";
import { createRagAdminClient, persistRagChunkEmbedding } from "../src/lib/rag/persistence";
import { searchRagChunks } from "../src/lib/rag/retrieval";
import { requireRagSmokeEnvironment } from "../src/lib/rag/server-config";
import { RAG_SMOKE_CASES, selectRagSmokeChunks } from "../src/lib/rag/smoke-selection";

const projectRoot = process.cwd();
loadEnvConfig(projectRoot);

async function main() {
  const config = requireRagSmokeEnvironment();
  const corpusPath = path.join(projectRoot, "content", "generated", "rag-chunks.json");
  const corpus = JSON.parse(await fs.readFile(corpusPath, "utf8")) as RagCorpusFile;
  const selected = selectRagSmokeChunks(corpus);

  if (selected.length !== 3) throw new Error("La prueba RAG debe indexar exactamente tres chunks.");

  const provider = new GeminiRagEmbeddingProvider(config.geminiApiKey);
  const admin = createRagAdminClient();
  const inserted = [];

  for (const { chunk } of selected) {
    const embedding = await embedRagChunk(provider, chunk);
    const ids = await persistRagChunkEmbedding(admin, chunk, embedding);
    inserted.push({
      ...ids,
      moduleSlug: chunk.moduleSlug,
      contentSha256: chunk.contentSha256,
      dimensions: embedding.length,
    });
  }

  const searches = [];
  for (const testCase of RAG_SMOKE_CASES) {
    const results = await searchRagChunks({
      admin,
      provider,
      query: testCase.query,
      courseSlug: corpus.chunks[0]?.courseSlug ?? "ia-educativa-notebooklm",
      matchCount: 3,
    });
    searches.push({
      query: testCase.query,
      expectedModuleSlug: testCase.moduleSlug,
      correctTopResult: results[0]?.moduleSlug === testCase.moduleSlug,
      results: results.map((result) => ({
        similarity: result.similarity,
        moduleSlug: result.moduleSlug,
        moduleTitle: result.moduleTitle,
        sectionTitle: result.sectionTitle,
        subsectionTitle: result.subsectionTitle,
        pages: [result.pageStart, result.pageEnd],
        sourceFile: result.sourceFile,
        contentSha256: result.contentSha256,
        firstLines: result.content.split("\n").slice(0, 3).join("\n"),
      })),
    });
  }

  console.log(JSON.stringify({
    model: provider.model,
    dimensions: provider.dimensions,
    inserted,
    searches,
  }, null, 2));

  const failed = searches.filter((search) => !search.correctTopResult);
  if (failed.length > 0) {
    throw new Error(`Fallaron ${failed.length} de las ${searches.length} comprobaciones semánticas.`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
