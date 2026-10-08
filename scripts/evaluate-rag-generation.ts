import fs from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import {
  DEFAULT_EMBEDDING_BATCH_SIZE,
  embedRagQueriesInBatches,
  safeErrorSummary,
} from "../src/lib/rag/batching";
import type { RagCorpusFile } from "../src/lib/rag/corpus";
import { selectRagContext } from "../src/lib/rag/context-selection";
import { GeminiRagEmbeddingProvider } from "../src/lib/rag/gemini-embedding-provider";
import { GeminiRagGenerationProvider } from "../src/lib/rag/gemini-generation-provider";
import { RAG_GENERATION_EVALUATION_CASES } from "../src/lib/rag/generation-evaluation-cases";
import {
  auditRagAnswerCitations,
  generateGroundedRagAnswer,
  type GroundedRagAnswer,
  type RagAnswerSource,
  type RagCitationAudit,
} from "../src/lib/rag/grounded-answer";
import { createRagAdminClient } from "../src/lib/rag/persistence";
import { searchRagChunksByEmbedding } from "../src/lib/rag/retrieval";
import { requireRagAnswerEnvironment } from "../src/lib/rag/server-config";
import { DEFAULT_RAG_RETRIEVAL_TOP_K } from "../src/lib/rag/tutor";

const projectRoot = process.cwd();
const corpusPath = path.join(projectRoot, "content", "generated", "rag-chunks.json");
const outputPath = path.join(
  projectRoot,
  "content",
  "generated",
  "rag-generation-evaluation.json",
);

type RetrievalResult = Awaited<ReturnType<typeof searchRagChunksByEmbedding>>[number];

function retrievalMetadata(result: RetrievalResult) {
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

type EvaluationResult = {
  id: string;
  group: string;
  question: string;
  expectedAnswerable: boolean;
  expectedLabel: string;
  top1Similarity: number | null;
  status: GroundedRagAnswer["status"] | "error";
  generatorCalled: boolean;
  generatorApiRequests: number;
  generatorRetries: number;
  answer: string | null;
  citations: string[];
  citationValidation: RagCitationAudit | null;
  sources: RagAnswerSource[];
  contextChunks: Array<ReturnType<typeof retrievalMetadata> & {
    id: string;
    content: string;
  }>;
  retrievalTop8: Array<ReturnType<typeof retrievalMetadata>>;
  error: string | null;
};

type ExistingReport = {
  courseSlug?: string;
  corpusVersion?: string;
  generationModel?: string;
  threshold?: number;
  topK?: number;
  cases?: EvaluationResult[];
};

function isReusableResult(result: EvaluationResult) {
  return result.expectedAnswerable
    ? result.status === "answered" && result.citationValidation?.allCitationsValid === true
    : result.status === "insufficient_evidence" && !result.generatorCalled;
}

function isLongQuotaFailure(error: string | null) {
  return Boolean(error && (
    /generate_content_free_tier_requests/i.test(error)
    || /retryDelay[^0-9]*[0-9]{4,}s/i.test(error)
    || /retry in [0-9]+h/i.test(error)
  ));
}

async function loadReusableResults(options: {
  courseSlug: string;
  corpusVersion: string;
  generationModel: string;
  threshold: number;
}) {
  try {
    const report = JSON.parse(await fs.readFile(outputPath, "utf8")) as ExistingReport;
    const compatible = report.courseSlug === options.courseSlug
      && report.corpusVersion === options.corpusVersion
      && report.generationModel === options.generationModel
      && report.threshold === options.threshold
      && report.topK === DEFAULT_RAG_RETRIEVAL_TOP_K;
    return compatible ? (report.cases ?? []).filter(isReusableResult) : [];
  } catch (error) {
    const code = error && typeof error === "object"
      ? (error as { code?: unknown }).code
      : null;
    if (code === "ENOENT") return [];
    throw error;
  }
}

function summarize(results: EvaluationResult[], embeddingRetriesThisRun: number) {
  const answerable = results.filter(({ expectedAnswerable }) => expectedAnswerable);
  const external = results.filter(({ expectedAnswerable }) => !expectedAnswerable);
  return {
    totalCases: results.length,
    answerableCases: answerable.length,
    outOfCorpusCases: external.length,
    answeredCases: results.filter(({ status }) => status === "answered").length,
    insufficientEvidenceCases: results.filter(({ status }) =>
      status === "insufficient_evidence").length,
    erroredCases: results.filter(({ status }) => status === "error").length,
    logicalGeneratorCalls: results.filter(({ generatorCalled }) => generatorCalled).length,
    generatorApiRequests: results.reduce((sum, result) =>
      sum + result.generatorApiRequests, 0),
    generatorRetries: results.reduce((sum, result) => sum + result.generatorRetries, 0),
    embeddingRetriesThisRun,
    validCitationCases: answerable.filter(({ citationValidation }) =>
      citationValidation?.allCitationsValid).length,
    casesWithUncitedBlocks: answerable.filter(({ citationValidation }) =>
      (citationValidation?.uncitedBlocks.length ?? 0) > 0).map(({ id }) => id),
    casesMentioningInternals: answerable.filter(({ citationValidation }) =>
      citationValidation?.mentionsInternalMechanics).map(({ id }) => id),
    externalGeneratorCalls: external.filter(({ generatorCalled }) => generatorCalled).length,
    externalRejections: external.filter(({ status }) =>
      status === "insufficient_evidence").length,
  };
}

async function main() {
  loadEnvConfig(projectRoot);
  const config = requireRagAnswerEnvironment();
  const corpus = JSON.parse(await fs.readFile(corpusPath, "utf8")) as RagCorpusFile;
  const courseSlug = corpus.chunks[0]?.courseSlug;
  if (!courseSlug) throw new Error("El corpus RAG no contiene courseSlug.");

  const admin = createRagAdminClient();
  const embeddingProvider = new GeminiRagEmbeddingProvider(config.geminiApiKey);
  let generatorApiRequestsThisRun = 0;
  let generatorRetriesThisRun = 0;
  let embeddingRetriesThisRun = 0;
  const generationProvider = new GeminiRagGenerationProvider(
    config.geminiApiKey,
    config.generationModel,
    {
      onRequest: () => { generatorApiRequestsThisRun += 1; },
      onRetry: ({ attempt, delayMs, reason }) => {
        generatorRetriesThisRun += 1;
        console.warn(
          `[rag:generation] Reintento generativo ${attempt} en ${delayMs} ms: ${reason}`,
        );
      },
    },
  );

  const reusable = await loadReusableResults({
    courseSlug,
    corpusVersion: corpus.corpusVersion,
    generationModel: generationProvider.model,
    threshold: config.similarityThreshold,
  });
  const resultsById = new Map(reusable.map((result) => [result.id, result]));
  const pendingCases = RAG_GENERATION_EVALUATION_CASES
    .filter(({ id }) => !resultsById.has(id))
    .sort((left, right) => Number(left.answerable) - Number(right.answerable));
  if (reusable.length > 0) {
    console.log(`[rag:generation] Reutilizando ${reusable.length} casos ya validados.`);
  }

  console.log(`[rag:generation] Embeddings para ${pendingCases.length} preguntas pendientes.`);
  const queryEmbeddings = await embedRagQueriesInBatches({
    provider: embeddingProvider,
    queries: pendingCases.map(({ question }) => question),
    batchSize: DEFAULT_EMBEDDING_BATCH_SIZE,
    onBatchComplete: ({ batchIndex, batchCount, processedItems, totalItems }) => {
      console.log(
        `[rag:generation] Embeddings lote ${batchIndex + 1}/${batchCount}: ${processedItems}/${totalItems}.`,
      );
    },
    onRetry: ({ attempt, delayMs, reason, batchIndex, batchCount }) => {
      embeddingRetriesThisRun += 1;
      console.warn(
        `[rag:generation] Reintento embedding ${attempt} del lote ${batchIndex + 1}/${batchCount} en ${delayMs} ms: ${reason}`,
      );
    },
  });

  const orderedResults = () => RAG_GENERATION_EVALUATION_CASES
    .map(({ id }) => resultsById.get(id))
    .filter((result): result is EvaluationResult => Boolean(result));

  const writeReport = async (complete: boolean) => {
    const results = orderedResults();
    const report = {
      generatedAt: new Date().toISOString(),
      complete,
      courseSlug,
      corpusVersion: corpus.corpusVersion,
      chunkingVersion: corpus.chunkingVersion,
      embeddingModel: embeddingProvider.model,
      embeddingDimensions: embeddingProvider.dimensions,
      generationModel: generationProvider.model,
      topK: DEFAULT_RAG_RETRIEVAL_TOP_K,
      threshold: config.similarityThreshold,
      thresholdStatus: "experimental",
      maxContextChunks: 5,
      resumedCases: reusable.length,
      summary: summarize(results, embeddingRetriesThisRun),
      cases: results,
    };
    await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  };

  for (const [index, testCase] of pendingCases.entries()) {
    const retrieval = await searchRagChunksByEmbedding({
      admin,
      queryEmbedding: queryEmbeddings[index],
      courseSlug,
      matchCount: DEFAULT_RAG_RETRIEVAL_TOP_K,
    });
    const requestCountBefore = generatorApiRequestsThisRun;
    const retryCountBefore = generatorRetriesThisRun;

    let result: EvaluationResult;
    try {
      const response = await generateGroundedRagAnswer({
        question: testCase.question,
        retrievalResults: retrieval,
        generationProvider,
        threshold: config.similarityThreshold,
      });
      const generatorCalled = generatorApiRequestsThisRun > requestCountBefore;
      const contexts = response.status === "answered" ? selectRagContext(retrieval) : [];
      const citationAudit = response.answer
        ? auditRagAnswerCitations(response.answer, response.sources)
        : null;

      result = {
        id: testCase.id,
        group: testCase.group,
        question: testCase.question,
        expectedAnswerable: testCase.answerable,
        expectedLabel: testCase.expectedLabel,
        top1Similarity: retrieval[0]?.similarity ?? null,
        status: response.status,
        generatorCalled,
        generatorApiRequests: generatorApiRequestsThisRun - requestCountBefore,
        generatorRetries: generatorRetriesThisRun - retryCountBefore,
        answer: response.answer,
        citations: citationAudit?.citations ?? [],
        citationValidation: citationAudit,
        sources: response.sources,
        contextChunks: contexts.map(({ id, result: contextResult }) => ({
          id,
          ...retrievalMetadata(contextResult),
          content: contextResult.content,
        })),
        retrievalTop8: retrieval.map(retrievalMetadata),
        error: null,
      };
    } catch (error) {
      result = {
        id: testCase.id,
        group: testCase.group,
        question: testCase.question,
        expectedAnswerable: testCase.answerable,
        expectedLabel: testCase.expectedLabel,
        top1Similarity: retrieval[0]?.similarity ?? null,
        status: "error",
        generatorCalled: generatorApiRequestsThisRun > requestCountBefore,
        generatorApiRequests: generatorApiRequestsThisRun - requestCountBefore,
        generatorRetries: generatorRetriesThisRun - retryCountBefore,
        answer: null,
        citations: [],
        citationValidation: null,
        sources: [],
        contextChunks: [],
        retrievalTop8: retrieval.map(retrievalMetadata),
        error: safeErrorSummary(error),
      };
    }

    resultsById.set(testCase.id, result);
    await writeReport(false);
    console.log(
      `[rag:generation] Caso ${reusable.length + index + 1}/${RAG_GENERATION_EVALUATION_CASES.length}: ${testCase.id} → ${result.status}.`,
    );
    if (result.status === "error" && isLongQuotaFailure(result.error)) {
      throw new Error(
        "Gemini agotó una cuota con espera prolongada; el checkpoint conserva los casos terminados.",
      );
    }
  }

  const results = orderedResults();
  const answerable = results.filter(({ expectedAnswerable }) => expectedAnswerable);
  const external = results.filter(({ expectedAnswerable }) => !expectedAnswerable);
  const failures = [
    ...answerable.filter(({ status }) => status !== "answered"),
    ...external.filter(({ status, generatorCalled }) =>
      status !== "insufficient_evidence" || generatorCalled),
  ];
  await writeReport(failures.length === 0);
  console.log(`[rag:generation] Informe: ${path.relative(projectRoot, outputPath)}.`);
  console.log(JSON.stringify(summarize(results, embeddingRetriesThisRun), null, 2));

  if (failures.length > 0) {
    throw new Error(
      `La evaluación generativa falló en: ${failures.map(({ id }) => id).join(", ")}.`,
    );
  }
}

main().catch((error) => {
  console.error(`[rag:generation] ${safeErrorSummary(error)}`);
  process.exit(1);
});
