import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { RAG_TUTOR_PROMPT_VERSION } from "./answer-prompt";
import { resolveRagAssistantIdentity } from "./assistant-identity";
import {
  buildRagCacheIdentity,
  executeProtectedRagRequest,
  SupabaseRagAssistantProtectionStore,
} from "./assistant-protection";
import { DEFAULT_RAG_MAX_CONTEXT_CHUNKS } from "./context-selection";
import { RAG_CORPUS_VERSION } from "./corpus";
import { RAG_EMBEDDING_MODEL } from "./embedding-provider";
import { GeminiRagEmbeddingProvider } from "./gemini-embedding-provider";
import { GeminiRagGenerationProvider } from "./gemini-generation-provider";
import type { GroundedRagAnswer, RagAssistantRequest } from "./public-contract";
import { requireRagAssistantEnvironment } from "./server-config";
import { answerRagQuestion, DEFAULT_RAG_RETRIEVAL_TOP_K } from "./tutor";

export async function answerRagAssistantQuestion(
  request: RagAssistantRequest,
  httpRequest: Request,
): Promise<GroundedRagAnswer> {
  const config = requireRagAssistantEnvironment();
  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("La configuración server-only de Supabase no está disponible.");
  }

  const identity = await resolveRagAssistantIdentity(httpRequest, config.rateLimitSecret);
  const store = new SupabaseRagAssistantProtectionStore(admin);
  const dailyLimit = identity.subjectType === "authenticated"
    ? config.authenticatedDailyLimit
    : config.anonymousDailyLimit;
  const minuteLimit = identity.subjectType === "authenticated"
    ? config.authenticatedMinuteLimit
    : config.anonymousMinuteLimit;
  const cacheIdentity = buildRagCacheIdentity({
    question: request.question,
    courseSlug: request.courseSlug,
    moduleSlug: request.moduleSlug,
    corpusVersion: RAG_CORPUS_VERSION,
    embeddingModel: RAG_EMBEDDING_MODEL,
    generationModel: config.generationModel,
    promptVersion: RAG_TUTOR_PROMPT_VERSION,
    threshold: config.similarityThreshold,
    topK: DEFAULT_RAG_RETRIEVAL_TOP_K,
    maxContextChunks: DEFAULT_RAG_MAX_CONTEXT_CHUNKS,
  });

  return executeProtectedRagRequest({
    store,
    identity,
    dailyLimit,
    minuteLimit,
    generationBudget: config.dailyGenerationBudget,
    embeddingBudget: config.dailyEmbeddingBudget,
    cacheIdentity,
    cacheTtlSeconds: config.cacheTtlSeconds,
    execute: ({ beforeEmbeddingRequest, beforeGenerationRequest }) => answerRagQuestion({
      admin,
      embeddingProvider: new GeminiRagEmbeddingProvider(config.geminiApiKey, {
        onRequest: beforeEmbeddingRequest,
      }),
      generationProvider: new GeminiRagGenerationProvider(
        config.geminiApiKey,
        config.generationModel,
        { onRequest: beforeGenerationRequest },
      ),
      question: request.question,
      courseSlug: request.courseSlug,
      moduleSlug: request.moduleSlug,
      filterByModule: false,
      threshold: config.similarityThreshold,
      topK: DEFAULT_RAG_RETRIEVAL_TOP_K,
      maxContextChunks: DEFAULT_RAG_MAX_CONTEXT_CHUNKS,
    }),
  });
}

export function isRagAssistantApiEnabled() {
  const configured = process.env.RAG_ASSISTANT_API_ENABLED?.trim().toLowerCase();
  if (configured === "true") return true;
  if (configured === "false") return false;
  return process.env.NODE_ENV !== "production";
}
