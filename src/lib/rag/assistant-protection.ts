import "server-only";
import { createHash, createHmac, randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { RagAssistantProtectionError } from "./assistant-errors";
import type { GroundedRagAnswer } from "./public-contract";

export { RagAssistantProtectionError } from "./assistant-errors";

export type RagAssistantIdentity = {
  subjectHash: string;
  subjectType: "anonymous" | "authenticated";
};

export type RagAssistantMetric =
  | "requests"
  | "cache_hits"
  | "generations"
  | "insufficient_evidence"
  | "rate_limits"
  | "errors_global_budget"
  | "errors_provider_quota"
  | "errors_provider_temporary"
  | "errors_internal";

export type RagCacheIdentity = {
  cacheKey: string;
  questionHash: string;
  configurationHash: string;
  courseSlug: string;
  moduleSlug: string | null;
  corpusVersion: string;
  embeddingModel: string;
  generationModel: string;
  promptVersion: string;
};

export type RagRequestLimitResult = {
  allowed: boolean;
  rejectionReason: "minute_limit" | "daily_limit" | null;
};

export interface RagAssistantProtectionStore {
  consumeRequestLimit(options: {
    identity: RagAssistantIdentity;
    dailyLimit: number;
    minuteLimit: number;
  }): Promise<RagRequestLimitResult>;
  reserveDailyBudget(kind: "embedding" | "generation", limit: number): Promise<boolean>;
  getCachedAnswer(cacheKey: string): Promise<GroundedRagAnswer | null>;
  putCachedAnswer(options: {
    identity: RagCacheIdentity;
    answer: GroundedRagAnswer;
    expiresAt: string;
  }): Promise<void>;
  incrementMetric(metric: RagAssistantMetric): Promise<void>;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizeRagCacheQuestion(question: string) {
  return question.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
}

export function buildRagCacheIdentity(options: {
  question: string;
  courseSlug: string;
  moduleSlug?: string | null;
  corpusVersion: string;
  embeddingModel: string;
  generationModel: string;
  promptVersion: string;
  threshold: number;
  topK: number;
  maxContextChunks: number;
}) {
  const normalizedQuestion = normalizeRagCacheQuestion(options.question);
  const configuration = {
    threshold: options.threshold,
    topK: options.topK,
    maxContextChunks: options.maxContextChunks,
  };
  const identity = {
    question: normalizedQuestion,
    courseSlug: options.courseSlug,
    moduleSlug: options.moduleSlug ?? null,
    corpusVersion: options.corpusVersion,
    embeddingModel: options.embeddingModel,
    generationModel: options.generationModel,
    promptVersion: options.promptVersion,
    configuration,
  };

  return {
    cacheKey: sha256(JSON.stringify(identity)),
    questionHash: sha256(normalizedQuestion),
    configurationHash: sha256(JSON.stringify(configuration)),
    courseSlug: options.courseSlug,
    moduleSlug: options.moduleSlug ?? null,
    corpusVersion: options.corpusVersion,
    embeddingModel: options.embeddingModel,
    generationModel: options.generationModel,
    promptVersion: options.promptVersion,
  } satisfies RagCacheIdentity;
}

export function createRagSubjectHash(secret: string, kind: string, subject: string) {
  if (secret.length < 32) {
    throw new Error("RAG_RATE_LIMIT_SECRET debe tener al menos 32 caracteres.");
  }
  return createHmac("sha256", secret).update(`${kind}:${subject}`).digest("hex");
}

export function createAnonymousSessionId() {
  return randomBytes(32).toString("base64url");
}

function isRagAnswerSource(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const source = value as Record<string, unknown>;
  return typeof source.id === "string"
    && (typeof source.moduleNumber === "number" || source.moduleNumber === null)
    && (typeof source.moduleTitle === "string" || source.moduleTitle === null)
    && (typeof source.sectionTitle === "string" || source.sectionTitle === null)
    && (typeof source.subsectionTitle === "string" || source.subsectionTitle === null)
    && typeof source.pageStart === "number"
    && typeof source.pageEnd === "number"
    && (typeof source.routePath === "string" || source.routePath === null)
    && typeof source.similarity === "number";
}

export function parseCachedRagAnswer(value: unknown): GroundedRagAnswer | null {
  if (!value || typeof value !== "object") return null;
  const answer = value as Record<string, unknown>;
  if (answer.status === "insufficient_evidence") {
    return answer.answer === null && Array.isArray(answer.sources) && answer.sources.length === 0
      ? { status: "insufficient_evidence", answer: null, sources: [] }
      : null;
  }
  if (
    answer.status !== "answered"
    || typeof answer.answer !== "string"
    || !answer.answer.trim()
    || !Array.isArray(answer.sources)
    || answer.sources.length === 0
    || !answer.sources.every(isRagAnswerSource)
  ) {
    return null;
  }
  return answer as GroundedRagAnswer;
}

type RequestLimitRow = {
  allowed: boolean;
  rejection_reason: "minute_limit" | "daily_limit" | null;
};

export class SupabaseRagAssistantProtectionStore implements RagAssistantProtectionStore {
  constructor(private readonly admin: SupabaseClient) {}

  async consumeRequestLimit(options: {
    identity: RagAssistantIdentity;
    dailyLimit: number;
    minuteLimit: number;
  }) {
    const { data, error } = await this.admin.rpc("consume_rag_request_limit", {
      p_subject_hash: options.identity.subjectHash,
      p_subject_type: options.identity.subjectType,
      p_daily_limit: options.dailyLimit,
      p_minute_limit: options.minuteLimit,
    });
    if (error) throw new Error(`No se pudo verificar el límite del tutor: ${error.message}`);
    const row = (data as RequestLimitRow[] | null)?.[0];
    if (!row) throw new Error("La verificación del límite del tutor no devolvió un resultado.");
    return { allowed: row.allowed, rejectionReason: row.rejection_reason };
  }

  async reserveDailyBudget(kind: "embedding" | "generation", limit: number) {
    const { data, error } = await this.admin.rpc("reserve_rag_daily_budget", {
      p_budget_kind: kind,
      p_daily_budget: limit,
    });
    if (error) throw new Error(`No se pudo verificar el presupuesto del tutor: ${error.message}`);
    return data === true;
  }

  async getCachedAnswer(cacheKey: string) {
    const { data, error } = await this.admin
      .from("rag_response_cache")
      .select("response")
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (error) throw new Error(`No se pudo consultar la caché del tutor: ${error.message}`);
    return parseCachedRagAnswer(data?.response);
  }

  async putCachedAnswer(options: {
    identity: RagCacheIdentity;
    answer: GroundedRagAnswer;
    expiresAt: string;
  }) {
    const { identity } = options;
    const { error } = await this.admin.from("rag_response_cache").upsert({
      cache_key: identity.cacheKey,
      question_hash: identity.questionHash,
      course_slug: identity.courseSlug,
      module_slug: identity.moduleSlug,
      corpus_version: identity.corpusVersion,
      embedding_model: identity.embeddingModel,
      generation_model: identity.generationModel,
      prompt_version: identity.promptVersion,
      configuration_hash: identity.configurationHash,
      response: options.answer,
      created_at: new Date().toISOString(),
      expires_at: options.expiresAt,
    }, { onConflict: "cache_key" });
    if (error) throw new Error(`No se pudo actualizar la caché del tutor: ${error.message}`);
  }

  async incrementMetric(metric: RagAssistantMetric) {
    const { error } = await this.admin.rpc("increment_rag_metric", {
      p_metric_name: metric,
    });
    if (error) throw new Error(`No se pudo registrar la métrica del tutor: ${error.message}`);
  }
}

async function safeMetric(store: RagAssistantProtectionStore, metric: RagAssistantMetric) {
  try {
    await store.incrementMetric(metric);
  } catch {
    // Metrics are deliberately best-effort and must never expose or block learner traffic.
  }
}

function errorStatus(error: unknown) {
  if (error && typeof error === "object") {
    const candidate = error as { status?: unknown; code?: unknown };
    const status = Number(candidate.status ?? candidate.code);
    if (Number.isInteger(status)) return status;
  }
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/(?:HTTP|code["']?\s*:)\s*(429|503|504)\b/i);
  return match ? Number(match[1]) : null;
}

export async function executeProtectedRagRequest(options: {
  store: RagAssistantProtectionStore;
  identity: RagAssistantIdentity;
  dailyLimit: number;
  minuteLimit: number;
  generationBudget: number;
  embeddingBudget: number;
  cacheIdentity: RagCacheIdentity;
  cacheTtlSeconds: number;
  execute: (hooks: {
    beforeEmbeddingRequest: () => Promise<void>;
    beforeGenerationRequest: () => Promise<void>;
  }) => Promise<GroundedRagAnswer>;
}) {
  await safeMetric(options.store, "requests");
  const limit = await options.store.consumeRequestLimit({
    identity: options.identity,
    dailyLimit: options.dailyLimit,
    minuteLimit: options.minuteLimit,
  });
  if (!limit.allowed) {
    await safeMetric(options.store, "rate_limits");
    if (limit.rejectionReason === "minute_limit") {
      throw new RagAssistantProtectionError("burst_limit", 429);
    }
    throw new RagAssistantProtectionError(
      options.identity.subjectType === "authenticated"
        ? "authenticated_daily_limit"
        : "anonymous_daily_limit",
      429,
    );
  }

  try {
    const cached = await options.store.getCachedAnswer(options.cacheIdentity.cacheKey);
    if (cached) {
      await safeMetric(options.store, "cache_hits");
      if (cached.status === "insufficient_evidence") {
        await safeMetric(options.store, "insufficient_evidence");
      }
      return cached;
    }
  } catch {
    // Cache availability is not a security boundary; continue with protected execution.
  }

  try {
    const answer = await options.execute({
      beforeEmbeddingRequest: async () => {
        const available = await options.store.reserveDailyBudget(
          "embedding",
          options.embeddingBudget,
        );
        if (!available) throw new RagAssistantProtectionError("global_capacity", 503);
      },
      beforeGenerationRequest: async () => {
        const available = await options.store.reserveDailyBudget(
          "generation",
          options.generationBudget,
        );
        if (!available) throw new RagAssistantProtectionError("global_capacity", 503);
        await safeMetric(options.store, "generations");
      },
    });

    if (answer.status === "insufficient_evidence") {
      await safeMetric(options.store, "insufficient_evidence");
    }

    try {
      await options.store.putCachedAnswer({
        identity: options.cacheIdentity,
        answer,
        expiresAt: new Date(Date.now() + options.cacheTtlSeconds * 1_000).toISOString(),
      });
    } catch {
      // Cache writes are best-effort; a valid grounded answer remains usable.
    }
    return answer;
  } catch (error) {
    if (error instanceof RagAssistantProtectionError) {
      await safeMetric(options.store, "errors_global_budget");
    } else {
      const status = errorStatus(error);
      await safeMetric(
        options.store,
        status === 429
          ? "errors_provider_quota"
          : status === 503 || status === 504
            ? "errors_provider_temporary"
            : "errors_internal",
      );
    }
    throw error;
  }
}
