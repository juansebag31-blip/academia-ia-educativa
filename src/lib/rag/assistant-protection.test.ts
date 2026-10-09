import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { GroundedRagAnswer } from "./public-contract";
import {
  buildRagCacheIdentity,
  executeProtectedRagRequest,
  RagAssistantProtectionError,
  type RagAssistantIdentity,
  type RagAssistantMetric,
  type RagAssistantProtectionStore,
  type RagCacheIdentity,
  type RagRequestLimitResult,
} from "./assistant-protection";

const anonymous: RagAssistantIdentity = {
  subjectType: "anonymous",
  subjectHash: "a".repeat(64),
};
const authenticated: RagAssistantIdentity = {
  subjectType: "authenticated",
  subjectHash: "b".repeat(64),
};
const insufficient: GroundedRagAnswer = {
  status: "insufficient_evidence",
  answer: null,
  sources: [],
};
const answered: GroundedRagAnswer = {
  status: "answered",
  answer: "NotebookLM trabaja con las fuentes seleccionadas [S1].",
  sources: [{
    id: "S1",
    moduleNumber: 6,
    moduleTitle: "NotebookLM desde cero",
    sectionTitle: "Qué es NotebookLM",
    subsectionTitle: null,
    pageStart: 2,
    pageEnd: 3,
    routePath: "/courses/ia-educativa-notebooklm/modules/modulo-6",
    similarity: 0.83,
  }],
};

function cacheIdentity(overrides: Partial<Parameters<typeof buildRagCacheIdentity>[0]> = {}) {
  return buildRagCacheIdentity({
    question: "¿Qué es NotebookLM?",
    courseSlug: "ia-educativa-notebooklm",
    moduleSlug: null,
    corpusVersion: "corpus-v1",
    embeddingModel: "gemini-embedding-2",
    generationModel: "gemini-3.5-flash-lite",
    promptVersion: "prompt-v1",
    threshold: 0.7,
    topK: 8,
    maxContextChunks: 5,
    ...overrides,
  });
}

class FakeStore implements RagAssistantProtectionStore {
  limitResult: RagRequestLimitResult = { allowed: true, rejectionReason: null };
  budget = { embedding: true, generation: true };
  cache = new Map<string, GroundedRagAnswer>();
  metrics: RagAssistantMetric[] = [];
  requestLimits: Array<{ identity: RagAssistantIdentity; dailyLimit: number; minuteLimit: number }> = [];
  budgetCalls: Array<"embedding" | "generation"> = [];

  async consumeRequestLimit(options: {
    identity: RagAssistantIdentity;
    dailyLimit: number;
    minuteLimit: number;
  }) {
    this.requestLimits.push(options);
    return this.limitResult;
  }

  async reserveDailyBudget(kind: "embedding" | "generation") {
    this.budgetCalls.push(kind);
    return this.budget[kind];
  }

  async getCachedAnswer(cacheKey: string) {
    return this.cache.get(cacheKey) ?? null;
  }

  async putCachedAnswer(options: {
    identity: RagCacheIdentity;
    answer: GroundedRagAnswer;
    expiresAt: string;
  }) {
    this.cache.set(options.identity.cacheKey, options.answer);
  }

  async incrementMetric(metric: RagAssistantMetric) {
    this.metrics.push(metric);
  }
}

function run(options: {
  store: FakeStore;
  identity?: RagAssistantIdentity;
  execute?: Parameters<typeof executeProtectedRagRequest>[0]["execute"];
  cache?: RagCacheIdentity;
}) {
  return executeProtectedRagRequest({
    store: options.store,
    identity: options.identity ?? anonymous,
    dailyLimit: options.identity?.subjectType === "authenticated" ? 20 : 5,
    minuteLimit: options.identity?.subjectType === "authenticated" ? 5 : 2,
    generationBudget: 400,
    embeddingBudget: 450,
    cacheIdentity: options.cache ?? cacheIdentity(),
    cacheTtlSeconds: 60,
    execute: options.execute ?? (async () => answered),
  });
}

describe("RAG assistant quota protection", () => {
  it("allows an anonymous visitor within the configured limits", async () => {
    const store = new FakeStore();
    await expect(run({ store })).resolves.toEqual(answered);
    expect(store.requestLimits[0]).toEqual({ identity: anonymous, dailyLimit: 5, minuteLimit: 2 });
  });

  it("rejects an anonymous visitor over the daily limit", async () => {
    const store = new FakeStore();
    store.limitResult = { allowed: false, rejectionReason: "daily_limit" };
    await expect(run({ store })).rejects.toMatchObject({
      publicCode: "anonymous_daily_limit",
      httpStatus: 429,
    });
  });

  it("uses the authenticated limits and rejects them with a distinct public code", async () => {
    const allowedStore = new FakeStore();
    await run({ store: allowedStore, identity: authenticated });
    expect(allowedStore.requestLimits[0]).toEqual({
      identity: authenticated,
      dailyLimit: 20,
      minuteLimit: 5,
    });

    const rejectedStore = new FakeStore();
    rejectedStore.limitResult = { allowed: false, rejectionReason: "daily_limit" };
    await expect(run({ store: rejectedStore, identity: authenticated })).rejects.toMatchObject({
      publicCode: "authenticated_daily_limit",
    });
  });

  it("rejects bursts before executing embeddings or generation", async () => {
    const store = new FakeStore();
    const execute = vi.fn(async () => answered);
    store.limitResult = { allowed: false, rejectionReason: "minute_limit" };
    await expect(run({ store, execute })).rejects.toMatchObject({ publicCode: "burst_limit" });
    expect(execute).not.toHaveBeenCalled();
  });

  it("stops at the global generation budget immediately before the generator", async () => {
    const store = new FakeStore();
    store.budget.generation = false;
    await expect(run({
      store,
      execute: async ({ beforeEmbeddingRequest, beforeGenerationRequest }) => {
        await beforeEmbeddingRequest();
        await beforeGenerationRequest();
        return answered;
      },
    })).rejects.toEqual(expect.any(RagAssistantProtectionError));
    expect(store.budgetCalls).toEqual(["embedding", "generation"]);
    expect(store.metrics).toContain("errors_global_budget");
    expect(store.metrics).not.toContain("generations");
  });

  it("does not reserve generation capacity for insufficient evidence", async () => {
    const store = new FakeStore();
    const result = await run({
      store,
      execute: async ({ beforeEmbeddingRequest }) => {
        await beforeEmbeddingRequest();
        return insufficient;
      },
    });
    expect(result).toEqual(insufficient);
    expect(store.budgetCalls).toEqual(["embedding"]);
    expect(store.metrics).toContain("insufficient_evidence");
    expect(store.metrics).not.toContain("generations");
  });

  it("returns an exact normalized cache hit without embeddings or generation", async () => {
    const store = new FakeStore();
    const canonical = cacheIdentity({ question: "¿Qué es NotebookLM?" });
    const equivalent = cacheIdentity({ question: "  ¿QUÉ   ES NotebookLM?  " });
    store.cache.set(canonical.cacheKey, answered);
    const execute = vi.fn(async () => answered);

    await expect(run({ store, cache: equivalent, execute })).resolves.toEqual(answered);
    expect(equivalent.cacheKey).toBe(canonical.cacheKey);
    expect(execute).not.toHaveBeenCalled();
    expect(store.budgetCalls).toEqual([]);
    expect(store.metrics).toContain("cache_hits");
  });

  it("invalidates the cache naturally when the corpus version changes", () => {
    const first = cacheIdentity({ corpusVersion: "corpus-v1" });
    const next = cacheIdentity({ corpusVersion: "corpus-v2" });
    expect(first.cacheKey).not.toBe(next.cacheKey);
  });

  it("classifies temporary provider errors without caching them", async () => {
    const store = new FakeStore();
    const error = Object.assign(new Error("provider internals"), { status: 503 });
    await expect(run({
      store,
      execute: async ({ beforeEmbeddingRequest }) => {
        await beforeEmbeddingRequest();
        throw error;
      },
    })).rejects.toBe(error);
    expect(store.cache.size).toBe(0);
    expect(store.metrics).toContain("errors_provider_temporary");
  });
});
