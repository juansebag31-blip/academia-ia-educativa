import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { RagCorpusFile } from "./corpus";
import {
  RAG_EMBEDDING_DIMENSIONS,
  assertRagEmbedding,
  embedRagChunk,
  embedRagChunks,
  embedRagQuery,
  type RagEmbeddingProvider,
} from "./embedding-provider";
import {
  getRagChunkEmbeddingTitle,
  prepareRagDocumentText,
  prepareRagQueryText,
} from "./embedding-text";
import { selectRagSmokeChunks } from "./smoke-selection";
import { RAG_RETRIEVAL_EVALUATION_CASES } from "./evaluation-cases";
import { evaluateRagCase, summarizeRagEvaluation } from "./evaluation";
import { suggestedRetryDelayMs, withTransientRetry } from "./batching";
import {
  planRagIndexing,
  ragChunkStableKey,
  type ExistingRagChunk,
} from "./indexing-plan";

const corpus = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "content", "generated", "rag-chunks.json"), "utf8"),
) as RagCorpusFile;

describe("RAG vector infrastructure", () => {
  it("uses Gemini Embedding 2 asymmetric QA formatting", () => {
    expect(prepareRagQueryText("¿Qué es NotebookLM?")).toBe(
      "task: question answering | query: ¿Qué es NotebookLM?",
    );
    expect(prepareRagDocumentText("NotebookLM", "Contenido educativo.")).toBe(
      "title: NotebookLM | text: Contenido educativo.",
    );
  });

  it("selects exactly the three requested non-cover chunks", () => {
    const selected = selectRagSmokeChunks(corpus);
    expect(selected.map(({ chunk }) => chunk.moduleNumber)).toEqual([2, 6, 11]);
    expect(selected.every(({ chunk }) => chunk.pageStart > 1)).toBe(true);
  });

  it("uses the same provider contract for documents and questions", async () => {
    const inputs: string[] = [];
    const provider: RagEmbeddingProvider = {
      model: "test-provider",
      dimensions: RAG_EMBEDDING_DIMENSIONS,
      async embed(text) {
        inputs.push(text);
        return Array.from({ length: RAG_EMBEDDING_DIMENSIONS }, () => 0.01);
      },
    };
    const chunk = selectRagSmokeChunks(corpus)[0].chunk;

    await embedRagChunk(provider, chunk);
    await embedRagQuery(provider, "¿Por qué puede inventar información?");

    expect(inputs[0]).toBe(prepareRagDocumentText(getRagChunkEmbeddingTitle(chunk), chunk.content));
    expect(inputs[1]).toBe(
      "task: question answering | query: ¿Por qué puede inventar información?",
    );
  });

  it("uses the SDK batch contract while preserving input order", async () => {
    const batches: string[][] = [];
    const provider: RagEmbeddingProvider = {
      model: "test-provider",
      dimensions: RAG_EMBEDDING_DIMENSIONS,
      async embed() {
        throw new Error("No debe usar llamadas individuales cuando existe embedMany.");
      },
      async embedMany(texts) {
        batches.push(texts);
        return texts.map((_, index) =>
          Array.from({ length: RAG_EMBEDDING_DIMENSIONS }, () => index + 0.01));
      },
    };
    const chunks = selectRagSmokeChunks(corpus).map(({ chunk }) => chunk);
    const embeddings = await embedRagChunks(provider, chunks);

    expect(batches).toHaveLength(1);
    expect(batches[0]).toHaveLength(3);
    expect(embeddings.map((embedding) => embedding[0])).toEqual([0.01, 1.01, 2.01]);
  });

  it("rejects embeddings with a dimension other than 768", () => {
    expect(() => assertRagEmbedding([0.1, 0.2])).toThrow("se esperaban 768 dimensiones");
  });

  it("honors Gemini retry delays for transient quota errors", () => {
    const error = new Error('{"error":{"code":429,"details":[{"retryDelay":"34s"}]}}');
    expect(suggestedRetryDelayMs(error)).toBe(34_250);
  });

  it("treats SDK request aborts caused by timeouts as transient", async () => {
    let attempts = 0;
    const result = await withTransientRetry(
      async () => {
        attempts += 1;
        if (attempts === 1) {
          const error = new Error("This operation was aborted") as Error & { code: number };
          error.code = 20;
          throw error;
        }
        return "recovered";
      },
      { baseDelayMs: 1 },
    );

    expect(result).toBe("recovered");
    expect(attempts).toBe(2);
  });

  it("does not retry a quota response whose server delay exceeds the configured limit", async () => {
    let attempts = 0;
    await expect(withTransientRetry(
      async () => {
        attempts += 1;
        throw new Error('{"error":{"code":429,"details":[{"retryDelay":"77898s"}]}}');
      },
      { maxDelayMs: 60_000 },
    )).rejects.toThrow("77898s");
    expect(attempts).toBe(1);
  });

  it("keeps the vector migration exact, server-only and without an approximate index", () => {
    const migrationName = fs.readdirSync(path.join(process.cwd(), "supabase", "migrations"))
      .find((name) => name.endsWith("_rag_vector_search.sql"));
    expect(migrationName).toBeTruthy();
    const sql = fs.readFileSync(
      path.join(process.cwd(), "supabase", "migrations", migrationName!),
      "utf8",
    );

    expect(sql).toContain("embedding extensions.vector(768) not null");
    expect(sql).toContain("security invoker");
    expect(sql).toContain("to service_role");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).not.toMatch(/\b(?:hnsw|ivfflat)\b/i);

    const reconciliationMigration = fs.readdirSync(path.join(process.cwd(), "supabase", "migrations"))
      .find((name) => name.endsWith("_rag_indexing_reconciliation.sql"));
    expect(reconciliationMigration).toBeTruthy();
    const reconciliationSql = fs.readFileSync(
      path.join(process.cwd(), "supabase", "migrations", reconciliationMigration!),
      "utf8",
    );
    expect(reconciliationSql).toContain("rag_chunks_course_source_chunk_idx");
    expect(reconciliationSql).toContain("chunks.word_count");
    expect(reconciliationSql).toContain("security invoker");
    expect(reconciliationSql).toContain("to service_role");
    expect(reconciliationSql).not.toMatch(/\b(?:hnsw|ivfflat)\b/i);
  });

  it("plans an idempotent full-corpus reconciliation and updates changed hashes", () => {
    const smokeChunks = selectRagSmokeChunks(corpus).map(({ chunk }) => chunk);
    const existing = smokeChunks.map((chunk, index): ExistingRagChunk => ({
      id: `chunk-${index}`,
      document_id: `document-${index}`,
      corpus_version: chunk.corpusVersion,
      chunking_version: chunk.chunkingVersion,
      course_slug: chunk.courseSlug,
      course_title: chunk.courseTitle,
      module_slug: chunk.moduleSlug,
      module_number: chunk.moduleNumber,
      module_title: chunk.moduleTitle,
      section_path: chunk.sectionPath,
      section_title: chunk.sectionTitle,
      subsection_title: chunk.subsectionTitle,
      document_title: chunk.documentTitle,
      source_file: chunk.sourceFile,
      source_kind: chunk.sourceKind,
      source_sha256: chunk.sourceSha256,
      page_start: chunk.pageStart,
      page_end: chunk.pageEnd,
      chunk_index: chunk.chunkIndex,
      content_sha256: chunk.contentSha256,
      character_count: chunk.characterCount,
      word_count: chunk.wordCount,
      language: chunk.language,
      route_path: chunk.routePath,
      embedding_model: "gemini-embedding-2",
      embedding_dimensions: 768,
    }));

    const initialPlan = planRagIndexing(corpus.chunks, existing);
    expect(initialPlan.reused).toBe(3);
    expect(initialPlan.created).toBe(corpus.chunks.length - 3);
    expect(initialPlan.updated).toBe(0);

    existing[0].content_sha256 = "f".repeat(64);
    const changedPlan = planRagIndexing(corpus.chunks, existing);
    expect(changedPlan.updated).toBe(1);
    expect(changedPlan.reused).toBe(2);
    expect(new Set(corpus.chunks.map(ragChunkStableKey)).size).toBe(corpus.chunks.length);
  });

  it("defines a balanced evaluation set and never marks out-of-corpus neighbors as correct", () => {
    expect(RAG_RETRIEVAL_EVALUATION_CASES.length).toBeGreaterThanOrEqual(30);
    const coveredModules = new Set(
      RAG_RETRIEVAL_EVALUATION_CASES
        .flatMap((testCase) => testCase.expectedTargets)
        .map((target) => target.moduleSlug)
        .filter((slug): slug is string => Boolean(slug)),
    );
    expect(coveredModules.size).toBe(11);
    expect(RAG_RETRIEVAL_EVALUATION_CASES.some((testCase) =>
      testCase.expectedTargets.some((target) => target.sourceKind === "program_overview"))).toBe(true);

    const unanswerable = RAG_RETRIEVAL_EVALUATION_CASES.find((testCase) => !testCase.answerable)!;
    const evaluated = evaluateRagCase(unanswerable, [{
      chunkId: "chunk",
      documentId: "document",
      content: "Contenido cercano pero no responde la pregunta externa.",
      courseSlug: "ia-educativa-notebooklm",
      courseTitle: "Curso",
      moduleSlug: "modulo-1-introduccion-historica-ia",
      moduleNumber: 1,
      moduleTitle: "Módulo 1",
      sectionPath: ["Presentación"],
      sectionTitle: "Presentación",
      subsectionTitle: null,
      documentTitle: "Módulo 1",
      sourceFile: "modulo-1.pdf",
      sourceKind: "module_pdf",
      sourceSha256: "a".repeat(64),
      pageStart: 1,
      pageEnd: 1,
      chunkIndex: 0,
      wordCount: 60,
      contentSha256: "b".repeat(64),
      routePath: null,
      similarity: 0.72,
    }]);
    const summary = summarizeRagEvaluation([evaluated]);

    expect(evaluated.correctRank).toBeNull();
    expect(evaluated.top1).toBe(false);
    expect(summary.unanswerableQueries).toBe(1);
  });

  it("documents only the server-side Gemini key", () => {
    const envExample = fs.readFileSync(path.join(process.cwd(), ".env.example"), "utf8");
    expect(envExample).toContain("SUPABASE_SECRET_KEY=");
    expect(envExample).not.toContain("SUPABASE_SERVICE_ROLE_KEY=");
    expect(envExample).toContain("GEMINI_API_KEY=");
    expect(envExample).toContain("GEMINI_RAG_MODEL=gemini-3.5-flash-lite");
    expect(envExample).toContain("RAG_SIMILARITY_THRESHOLD=0.700");
    expect(envExample).toContain("RAG_RATE_LIMIT_SECRET=");
    expect(envExample).toContain("RAG_ANONYMOUS_DAILY_LIMIT=5");
    expect(envExample).toContain("RAG_AUTHENTICATED_DAILY_LIMIT=20");
    expect(envExample).toContain("RAG_DAILY_GENERATION_BUDGET=400");
    expect(envExample).toContain("RAG_DAILY_EMBEDDING_BUDGET=450");
    expect(envExample).not.toContain("NEXT_PUBLIC_GEMINI_API_KEY=");
    expect(envExample).not.toContain("NEXT_PUBLIC_RAG_RATE_LIMIT_SECRET=");
    expect(envExample).not.toContain("NEXT_PUBLIC_GEMINI_RAG_MODEL=");
  });
});
