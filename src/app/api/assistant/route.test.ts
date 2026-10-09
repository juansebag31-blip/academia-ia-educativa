import { describe, expect, it, vi } from "vitest";
import { courseSeed } from "@/lib/course-seed";
import { handleAssistantRequest } from "@/lib/rag/assistant-handler";
import { RagAssistantProtectionError } from "@/lib/rag/assistant-errors";
import type { GroundedRagAnswer } from "@/lib/rag/public-contract";

const validBody = {
  question: "¿Por qué las fuentes son importantes en NotebookLM?",
  courseSlug: courseSeed.slug,
  moduleSlug: courseSeed.modules[5].slug,
};

function request(body: unknown, options: { method?: string; raw?: boolean } = {}) {
  return new Request("http://localhost/api/assistant", {
    method: options.method ?? "POST",
    headers: { "Content-Type": "application/json" },
    body: options.raw ? String(body) : JSON.stringify(body),
  });
}

function source() {
  return {
    id: "S1",
    moduleNumber: 6,
    moduleTitle: "NotebookLM desde cero",
    sectionTitle: "Fuentes",
    subsectionTitle: null,
    pageStart: 4,
    pageEnd: 5,
    routePath: `/courses/${courseSeed.slug}/modules/${courseSeed.modules[5].slug}`,
    similarity: 0.82,
  };
}

async function bodyOf(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("POST /api/assistant", () => {
  it("accepts a valid request and preserves optional module context", async () => {
    const answerQuestion = vi.fn(async (): Promise<GroundedRagAnswer> => ({
      status: "answered",
      answer: "Las fuentes delimitan el trabajo [S1].",
      sources: [source()],
    }));

    const response = await handleAssistantRequest(request(validBody), { answerQuestion });

    expect(response.status).toBe(200);
    expect(answerQuestion).toHaveBeenCalledWith(validBody);
    expect(await bodyOf(response)).toEqual(expect.objectContaining({ status: "answered" }));
  });

  it("rejects unsupported methods", async () => {
    const response = await handleAssistantRequest(request(validBody, { method: "PUT" }), {
      answerQuestion: vi.fn(),
    });

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
  });

  it("rejects an empty question", async () => {
    const response = await handleAssistantRequest(request({ ...validBody, question: "   " }), {
      answerQuestion: vi.fn(),
    });

    expect(response.status).toBe(400);
    expect((await bodyOf(response)).error).toEqual(expect.objectContaining({ code: "invalid_request" }));
  });

  it("rejects questions longer than the public limit", async () => {
    const answerQuestion = vi.fn();
    const response = await handleAssistantRequest(request({
      ...validBody,
      question: "x".repeat(1_201),
    }), { answerQuestion });

    expect(response.status).toBe(400);
    expect(answerQuestion).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const invalidJson = await handleAssistantRequest(request("{invalid", { raw: true }), {
      answerQuestion: vi.fn(),
    });

    expect(invalidJson.status).toBe(400);
  });

  it.each([
    "apiKey",
    "embedding",
    "similarityThreshold",
    "model",
    "prompt",
  ])("rejects the client-controlled field %s", async (field) => {
    const answerQuestion = vi.fn();
    const response = await handleAssistantRequest(request({
      ...validBody,
      [field]: "client-value",
    }), { answerQuestion });

    expect(response.status).toBe(400);
    expect(answerQuestion).not.toHaveBeenCalled();
  });

  it("returns an answered result with only the public contract", async () => {
    const response = await handleAssistantRequest(request(validBody), {
      answerQuestion: async () => ({
        status: "answered",
        answer: "Respuesta fundamentada [S1].",
        sources: [{ ...source(), internalPrompt: "hidden" } as ReturnType<typeof source>],
        embedding: [1, 2, 3],
      } as GroundedRagAnswer),
    });
    const body = await bodyOf(response);
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(200);
    expect(Object.keys(body)).toEqual(["status", "answer", "sources"]);
    expect(Object.keys((body.sources as Array<Record<string, unknown>>)[0])).toEqual([
      "id",
      "moduleNumber",
      "moduleTitle",
      "sectionTitle",
      "subsectionTitle",
      "pageStart",
      "pageEnd",
      "routePath",
      "similarity",
    ]);
    expect(serialized).toContain("Respuesta fundamentada");
    expect(serialized).not.toContain("internalPrompt");
    expect(serialized).not.toContain("embedding");
    expect(serialized).not.toContain("GEMINI_API_KEY");
  });

  it("returns insufficient_evidence without sources", async () => {
    const response = await handleAssistantRequest(request(validBody), {
      answerQuestion: async () => ({
        status: "insufficient_evidence",
        answer: null,
        sources: [],
      }),
    });

    expect(await bodyOf(response)).toEqual({
      status: "insufficient_evidence",
      answer: null,
      sources: [],
    });
  });

  it("maps provider quota errors without leaking provider details", async () => {
    const providerError = Object.assign(
      new Error("GEMINI_API_KEY=secret quota payload and stack details"),
      { status: 429 },
    );
    const response = await handleAssistantRequest(request(validBody), {
      answerQuestion: async () => { throw providerError; },
    });
    const serialized = JSON.stringify(await bodyOf(response));

    expect(response.status).toBe(429);
    expect(serialized).toContain("quota_exceeded");
    expect(serialized).not.toContain("secret");
    expect(serialized).not.toContain("stack");
  });

  it.each([
    ["anonymous_daily_limit", 429],
    ["authenticated_daily_limit", 429],
    ["burst_limit", 429],
    ["global_capacity", 503],
  ] as const)("maps the protected capacity state %s to a safe public error", async (code, status) => {
    const response = await handleAssistantRequest(request(validBody), {
      answerQuestion: async () => { throw new RagAssistantProtectionError(code, status); },
    });
    const serialized = JSON.stringify(await bodyOf(response));

    expect(response.status).toBe(status);
    expect(serialized).toContain(code);
    expect(serialized).not.toContain("SUPABASE_SECRET_KEY");
    expect(serialized).not.toContain("Gemini");
    expect(serialized).not.toContain("stack");
  });

  it.each([503, 504])("maps provider HTTP %s to a safe temporary error", async (status) => {
    const response = await handleAssistantRequest(request(validBody), {
      answerQuestion: async () => { throw Object.assign(new Error("provider internals"), { status }); },
    });

    expect(response.status).toBe(503);
    expect(await bodyOf(response)).toEqual({
      error: {
        code: "temporarily_unavailable",
        message: "El tutor no está disponible temporalmente. Intenta nuevamente en unos minutos.",
      },
    });
  });

  it("returns a safe timeout response", async () => {
    const response = await handleAssistantRequest(request(validBody), {
      answerQuestion: () => new Promise(() => undefined),
      timeoutMs: 1,
    });

    expect(response.status).toBe(504);
    expect(await bodyOf(response)).toEqual({
      error: {
        code: "request_timeout",
        message: "El tutor tardó demasiado en responder. Intenta nuevamente en unos minutos.",
      },
    });
  });

  it("does not expose unexpected errors, secrets or stack traces", async () => {
    const response = await handleAssistantRequest(request(validBody), {
      answerQuestion: async () => {
        throw new Error("SUPABASE_SECRET_KEY=private database stack trace");
      },
    });
    const serialized = JSON.stringify(await bodyOf(response));

    expect(response.status).toBe(500);
    expect(serialized).toContain("internal_error");
    expect(serialized).not.toContain("SUPABASE_SECRET_KEY");
    expect(serialized).not.toContain("private");
    expect(serialized).not.toContain("stack trace");
  });
});
