import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { GoogleGenAI } from "@google/genai";
import { loadEnvConfig } from "@next/env";
import { safeErrorSummary } from "../src/lib/rag/batching";
import type { RagCorpusFile } from "../src/lib/rag/corpus";
import { selectRagContext } from "../src/lib/rag/context-selection";
import { embedRagQuery } from "../src/lib/rag/embedding-provider";
import { RAG_GENERATION_EVALUATION_CASES } from "../src/lib/rag/generation-evaluation-cases";
import { GeminiRagEmbeddingProvider } from "../src/lib/rag/gemini-embedding-provider";
import { GeminiRagGenerationProvider } from "../src/lib/rag/gemini-generation-provider";
import {
  auditRagAnswerCitations,
  generateGroundedRagAnswer,
  type GroundedRagAnswer,
  type RagAnswerSource,
  type RagCitationAudit,
} from "../src/lib/rag/grounded-answer";
import { createRagAdminClient } from "../src/lib/rag/persistence";
import { searchRagChunksByEmbedding, type RagSearchResult } from "../src/lib/rag/retrieval";
import { requireRagAnswerEnvironment } from "../src/lib/rag/server-config";
import { DEFAULT_RAG_RETRIEVAL_TOP_K } from "../src/lib/rag/tutor";

const projectRoot = process.cwd();
const corpusPath = path.join(projectRoot, "content", "generated", "rag-chunks.json");
const baselinePath = path.join(
  projectRoot,
  "content",
  "generated",
  "rag-generation-evaluation.json",
);
const benchmarkVersion = "rag-generation-model-benchmark-full-v2";
const defaultGenerationDelayMs = 10_000;

type BaselineCase = {
  id: string;
  question: string;
  status: GroundedRagAnswer["status"] | "error";
  answer: string | null;
  citations: string[];
  citationValidation: RagCitationAudit | null;
  sources: RagAnswerSource[];
};

type BaselineReport = {
  complete?: boolean;
  generationModel?: string;
  cases?: BaselineCase[];
};

type BenchmarkResult = {
  id: string;
  category: string;
  kind: string;
  question: string;
  expectedAnswerable: boolean;
  expectedLabel: string;
  top1Similarity: number | null;
  status: GroundedRagAnswer["status"] | "error";
  answer: string | null;
  citations: string[];
  citationValidation: RagCitationAudit | null;
  sources: RagAnswerSource[];
  contextChunks: Array<ReturnType<typeof retrievalMetadata> & { id: string; content: string }>;
  retrievalTop8: ReturnType<typeof retrievalMetadata>[];
  timingsMs: {
    embedding: number;
    retrieval: number;
    generationOrGate: number;
    pacingWait: number;
    total: number;
  };
  requests: { embedding: number; retrieval: number; generation: number; total: number };
  generatorCalled: boolean;
  generatorRetries: number;
  retryEvents: Array<{ attempt: number; delayMs: number; reason: string }>;
  error: string | null;
  baseline: {
    model: string;
    caseId: string;
    sameQuestion: boolean;
    status: BaselineCase["status"];
    answer: string | null;
    citations: string[];
    citationValidation: RagCitationAudit | null;
    sources: RagAnswerSource[];
  } | null;
};

type ExistingBenchmarkReport = {
  benchmarkVersion?: string;
  courseSlug?: string;
  corpusVersion?: string;
  generationModel?: string;
  productionGenerationModel?: string;
  threshold?: number;
  topK?: number;
  executionRuns?: number;
  modelMetadataRequests?: number;
  cases?: BenchmarkResult[];
};

function retrievalMetadata(result: RagSearchResult) {
  return {
    chunkId: result.chunkId,
    moduleNumber: result.moduleNumber,
    moduleTitle: result.moduleTitle,
    sectionTitle: result.sectionTitle,
    subsectionTitle: result.subsectionTitle,
    pageStart: result.pageStart,
    pageEnd: result.pageEnd,
    routePath: result.routePath,
    similarity: result.similarity,
    contentSha256: result.contentSha256,
  };
}

function elapsed(startedAt: number) {
  return Math.round((performance.now() - startedAt) * 100) / 100;
}

function benchmarkModelFromEnvironment(productionModel: string) {
  const model = process.env.RAG_BENCHMARK_MODEL?.trim();
  if (!model) throw new Error("RAG_BENCHMARK_MODEL es obligatorio para este proceso.");
  if (model === productionModel) {
    throw new Error("El benchmark no puede regenerar el modelo productivo de referencia.");
  }
  return model;
}

function generationDelayFromEnvironment() {
  const raw = process.env.RAG_BENCHMARK_DELAY_MS?.trim();
  if (!raw) return defaultGenerationDelayMs;
  const delay = Number(raw);
  if (!Number.isInteger(delay) || delay < 0 || delay > 60_000) {
    throw new Error("RAG_BENCHMARK_DELAY_MS debe ser un entero entre 0 y 60000.");
  }
  return delay;
}

function safeModelFileName(model: string) {
  return model.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
}

function isReusableResult(result: BenchmarkResult) {
  if (!result.expectedAnswerable) {
    return result.status === "insufficient_evidence" && !result.generatorCalled;
  }
  return (result.status === "answered" && Boolean(result.answer))
    || (result.status === "error" && result.generatorCalled && result.requests.generation > 0);
}

async function loadResumeState(
  outputPath: string,
  expected: Omit<ExistingBenchmarkReport, "cases">,
) {
  try {
    const report = JSON.parse(await fs.readFile(outputPath, "utf8")) as ExistingBenchmarkReport;
    const compatible = report.benchmarkVersion === expected.benchmarkVersion
      && report.courseSlug === expected.courseSlug
      && report.corpusVersion === expected.corpusVersion
      && report.generationModel === expected.generationModel
      && report.productionGenerationModel === expected.productionGenerationModel
      && report.threshold === expected.threshold
      && report.topK === expected.topK;
    if (!compatible) return { results: [], executionRuns: 0, metadataRequests: 0 };
    return {
      results: (report.cases ?? []).filter(isReusableResult),
      executionRuns: report.executionRuns ?? 1,
      metadataRequests: report.modelMetadataRequests ?? 1,
    };
  } catch (error) {
    if (error && typeof error === "object" && (error as { code?: unknown }).code === "ENOENT") {
      return { results: [], executionRuns: 0, metadataRequests: 0 };
    }
    throw error;
  }
}

function resultSummary(results: BenchmarkResult[], metadataRequests: number) {
  const caseRequests = results.reduce((sum, result) => sum + result.requests.total, 0);
  return {
    totalCases: results.length,
    answeredCases: results.filter(({ status }) => status === "answered").length,
    insufficientEvidenceCases: results.filter(({ status }) => status === "insufficient_evidence").length,
    erroredCases: results.filter(({ status }) => status === "error").length,
    validCitationCases: results.filter(({ expectedAnswerable, citationValidation }) =>
      expectedAnswerable && citationValidation?.allCitationsValid).length,
    invalidCitationCases: results.filter(({ citationValidation }) =>
      (citationValidation?.invalidCitations.length ?? 0) > 0).map(({ id }) => id),
    casesWithUncitedBlocks: results.filter(({ citationValidation }) =>
      (citationValidation?.uncitedBlocks.length ?? 0) > 0).map(({ id }) => id),
    externalRejections: results.filter(({ expectedAnswerable, status, generatorCalled }) =>
      !expectedAnswerable && status === "insufficient_evidence" && !generatorCalled).length,
    externalGeneratorCalls: results.filter(({ expectedAnswerable, generatorCalled }) =>
      !expectedAnswerable && generatorCalled).length,
    requests: {
      modelMetadata: metadataRequests,
      embedding: results.reduce((sum, result) => sum + result.requests.embedding, 0),
      retrieval: results.reduce((sum, result) => sum + result.requests.retrieval, 0),
      generation: results.reduce((sum, result) => sum + result.requests.generation, 0),
      total: metadataRequests + caseRequests,
    },
    generatorRetries: results.reduce((sum, result) => sum + result.generatorRetries, 0),
  };
}

async function main() {
  loadEnvConfig(projectRoot);
  const config = requireRagAnswerEnvironment();
  const benchmarkModel = benchmarkModelFromEnvironment(config.generationModel);
  const generationDelayMs = generationDelayFromEnvironment();
  const outputPath = path.join(
    projectRoot,
    "content",
    "generated",
    `rag-generation-benchmark-full-${safeModelFileName(benchmarkModel)}.json`,
  );
  const corpus = JSON.parse(await fs.readFile(corpusPath, "utf8")) as RagCorpusFile;
  const courseSlug = corpus.chunks[0]?.courseSlug;
  if (!courseSlug) throw new Error("El corpus RAG no contiene courseSlug.");

  const baselineReport = JSON.parse(await fs.readFile(baselinePath, "utf8")) as BaselineReport;
  if (!baselineReport.complete || !baselineReport.generationModel) {
    throw new Error("El checkpoint generativo de referencia no está completo.");
  }
  const baselineById = new Map((baselineReport.cases ?? []).map((result) => [result.id, result]));
  const compatibility = {
    benchmarkVersion,
    courseSlug,
    corpusVersion: corpus.corpusVersion,
    generationModel: benchmarkModel,
    productionGenerationModel: config.generationModel,
    threshold: config.similarityThreshold,
    topK: DEFAULT_RAG_RETRIEVAL_TOP_K,
  };
  const resumeState = await loadResumeState(outputPath, compatibility);

  const modelClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
  const model = await modelClient.models.get({
    model: benchmarkModel,
    config: { httpOptions: { timeout: 30_000 } },
  });
  if (!model.supportedActions?.includes("generateContent")) {
    throw new Error(`${benchmarkModel} no declara soporte para generateContent.`);
  }
  const executionRuns = resumeState.executionRuns + 1;
  const modelMetadataRequests = resumeState.metadataRequests + 1;
  console.log(`[rag:benchmark] Modelo disponible: ${model.name ?? benchmarkModel}.`);

  const testCases = RAG_GENERATION_EVALUATION_CASES;
  const resultsById = new Map(resumeState.results.map((result) => [result.id, result]));
  const pending = testCases
    .filter(({ id }) => !resultsById.has(id))
    .sort((left, right) => Number(left.answerable) - Number(right.answerable));
  if (resumeState.results.length > 0) {
    console.log(`[rag:benchmark] Reutilizando ${resumeState.results.length} casos terminales.`);
  }

  const admin = createRagAdminClient();
  const embeddingProvider = new GeminiRagEmbeddingProvider(config.geminiApiKey);
  const orderedResults = () => testCases
    .map(({ id }) => resultsById.get(id))
    .filter((result): result is BenchmarkResult => Boolean(result));
  const writeReport = async (complete: boolean) => {
    const results = orderedResults();
    const report = {
      generatedAt: new Date().toISOString(),
      complete,
      ...compatibility,
      thresholdStatus: "experimental",
      embeddingModel: embeddingProvider.model,
      embeddingDimensions: embeddingProvider.dimensions,
      maxContextChunks: 5,
      generationAttemptsPerCase: 1,
      generationDelayMs,
      resumedCases: resumeState.results.length,
      executionRuns,
      modelMetadataRequests,
      modelAvailability: {
        name: model.name ?? benchmarkModel,
        displayName: model.displayName ?? null,
        supportedActions: model.supportedActions ?? [],
      },
      summary: resultSummary(results, modelMetadataRequests),
      cases: results,
    };
    await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  };

  let lastGenerationCompletedAt = 0;
  for (const [index, testCase] of pending.entries()) {
    const totalStartedAt = performance.now();
    let embeddingMs = 0;
    let retrievalMs = 0;
    let generationOrGateMs = 0;
    let pacingWaitMs = 0;
    let embeddingRequests = 0;
    let retrievalRequests = 0;
    let generationRequests = 0;
    let generatorRetries = 0;
    const retryEvents: BenchmarkResult["retryEvents"] = [];
    let retrieval: RagSearchResult[] = [];
    const generationProvider = new GeminiRagGenerationProvider(
      config.geminiApiKey,
      benchmarkModel,
      {
        maxAttempts: 1,
        onRequest: () => { generationRequests += 1; },
        onRetry: (event) => {
          generatorRetries += 1;
          retryEvents.push(event);
        },
      },
    );
    let result: BenchmarkResult;

    try {
      const embeddingStartedAt = performance.now();
      embeddingRequests += 1;
      const queryEmbedding = await embedRagQuery(embeddingProvider, testCase.question);
      embeddingMs = elapsed(embeddingStartedAt);
      const retrievalStartedAt = performance.now();
      retrievalRequests += 1;
      retrieval = await searchRagChunksByEmbedding({
        admin,
        queryEmbedding,
        courseSlug,
        matchCount: DEFAULT_RAG_RETRIEVAL_TOP_K,
      });
      retrievalMs = elapsed(retrievalStartedAt);

      const sufficient = (retrieval[0]?.similarity ?? -1) >= config.similarityThreshold
        && selectRagContext(retrieval).length > 0;
      if (sufficient && lastGenerationCompletedAt > 0) {
        pacingWaitMs = Math.max(0, generationDelayMs - (Date.now() - lastGenerationCompletedAt));
        if (pacingWaitMs > 0) await new Promise((resolve) => setTimeout(resolve, pacingWaitMs));
      }
      const generationStartedAt = performance.now();
      const response = await generateGroundedRagAnswer({
        question: testCase.question,
        retrievalResults: retrieval,
        generationProvider,
        threshold: config.similarityThreshold,
      });
      generationOrGateMs = elapsed(generationStartedAt);
      const contexts = response.status === "answered" ? selectRagContext(retrieval) : [];
      const citationValidation = response.answer
        ? auditRagAnswerCitations(response.answer, response.sources)
        : null;
      const baseline = baselineById.get(testCase.id);
      result = {
        id: testCase.id,
        category: testCase.group,
        kind: testCase.kind,
        question: testCase.question,
        expectedAnswerable: testCase.answerable,
        expectedLabel: testCase.expectedLabel,
        top1Similarity: retrieval[0]?.similarity ?? null,
        status: response.status,
        answer: response.answer,
        citations: citationValidation?.citations ?? [],
        citationValidation,
        sources: response.sources,
        contextChunks: contexts.map(({ id, result: contextResult }) => ({
          id,
          ...retrievalMetadata(contextResult),
          content: contextResult.content,
        })),
        retrievalTop8: retrieval.map(retrievalMetadata),
        timingsMs: {
          embedding: embeddingMs,
          retrieval: retrievalMs,
          generationOrGate: generationOrGateMs,
          pacingWait: pacingWaitMs,
          total: Math.max(0, elapsed(totalStartedAt) - pacingWaitMs),
        },
        requests: {
          embedding: embeddingRequests,
          retrieval: retrievalRequests,
          generation: generationRequests,
          total: embeddingRequests + retrievalRequests + generationRequests,
        },
        generatorCalled: generationRequests > 0,
        generatorRetries,
        retryEvents,
        error: null,
        baseline: baseline ? {
          model: baselineReport.generationModel,
          caseId: baseline.id,
          sameQuestion: baseline.question === testCase.question,
          status: baseline.status,
          answer: baseline.answer,
          citations: baseline.citations,
          citationValidation: baseline.citationValidation,
          sources: baseline.sources,
        } : null,
      };
    } catch (error) {
      result = {
        id: testCase.id,
        category: testCase.group,
        kind: testCase.kind,
        question: testCase.question,
        expectedAnswerable: testCase.answerable,
        expectedLabel: testCase.expectedLabel,
        top1Similarity: retrieval[0]?.similarity ?? null,
        status: "error",
        answer: null,
        citations: [],
        citationValidation: null,
        sources: [],
        contextChunks: [],
        retrievalTop8: retrieval.map(retrievalMetadata),
        timingsMs: {
          embedding: embeddingMs,
          retrieval: retrievalMs,
          generationOrGate: generationOrGateMs,
          pacingWait: pacingWaitMs,
          total: Math.max(0, elapsed(totalStartedAt) - pacingWaitMs),
        },
        requests: {
          embedding: embeddingRequests,
          retrieval: retrievalRequests,
          generation: generationRequests,
          total: embeddingRequests + retrievalRequests + generationRequests,
        },
        generatorCalled: generationRequests > 0,
        generatorRetries,
        retryEvents,
        error: safeErrorSummary(error),
        baseline: null,
      };
    }

    if (generationRequests > 0) lastGenerationCompletedAt = Date.now();
    resultsById.set(testCase.id, result);
    await writeReport(false);
    console.log(
      `[rag:benchmark] Caso ${resumeState.results.length + index + 1}/${testCases.length}: ${testCase.id} → ${result.status}.`,
    );
    if (result.status === "error") {
      console.warn(`[rag:benchmark] Fallo conservado sin reintento: ${result.error}`);
    }
  }

  const results = orderedResults();
  await writeReport(results.length === testCases.length);
  console.log(`[rag:benchmark] Informe: ${path.relative(projectRoot, outputPath)}.`);
  console.log(JSON.stringify(resultSummary(results, modelMetadataRequests), null, 2));
}

main().catch((error) => {
  console.error(`[rag:benchmark] ${safeErrorSummary(error)}`);
  process.exit(1);
});
