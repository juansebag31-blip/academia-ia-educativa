import { courseSeed } from "@/lib/course-seed";
import { RagAssistantProtectionError } from "./assistant-errors";
import {
  RAG_ASSISTANT_MAX_QUESTION_LENGTH,
  type GroundedRagAnswer,
  type RagAnswerSource,
  type RagAssistantErrorCode,
  type RagAssistantErrorResponse,
  type RagAssistantRequest,
} from "./public-contract";

const MAX_REQUEST_BODY_LENGTH = 16_384;
const DEFAULT_REQUEST_TIMEOUT_MS = 120_000;
const allowedRequestKeys = new Set(["question", "courseSlug", "moduleSlug"]);
const allowedModuleSlugs = new Set(courseSeed.modules.map(({ slug }) => slug));

type AssistantHandlerDependencies = {
  answerQuestion: (request: RagAssistantRequest) => Promise<GroundedRagAnswer>;
  timeoutMs?: number;
};

class RagAssistantTimeoutError extends Error {
  constructor() {
    super("RAG assistant request timed out");
    this.name = "RagAssistantTimeoutError";
  }
}

function jsonResponse(body: GroundedRagAnswer | RagAssistantErrorResponse, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function errorResponse(code: RagAssistantErrorCode, message: string, status: number) {
  return jsonResponse({ error: { code, message } }, status);
}

function statusFromError(error: unknown) {
  if (error && typeof error === "object") {
    const candidate = error as { status?: unknown; code?: unknown };
    const numeric = Number(candidate.status ?? candidate.code);
    if (Number.isInteger(numeric) && numeric >= 400 && numeric <= 599) return numeric;
  }
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/(?:HTTP|code["']?\s*:)\s*(429|503|504)\b/i);
  return match ? Number(match[1]) : null;
}

function publicProviderError(error: unknown) {
  if (error instanceof RagAssistantProtectionError) {
    const messages = {
      anonymous_daily_limit:
        "Alcanzaste el límite diario de consultas como visitante. Puedes volver a intentarlo mañana o iniciar sesión para disponer de más consultas.",
      authenticated_daily_limit:
        "Alcanzaste el límite diario de consultas del tutor. Podrás volver a utilizarlo mañana.",
      burst_limit:
        "Enviaste varias consultas en poco tiempo. Espera un minuto antes de volver a intentarlo.",
      global_capacity:
        "El tutor alcanzó temporalmente su capacidad diaria. Intenta nuevamente más tarde.",
    } as const;
    return errorResponse(error.publicCode, messages[error.publicCode], error.httpStatus);
  }

  if (error instanceof RagAssistantTimeoutError) {
    return errorResponse(
      "request_timeout",
      "El tutor tardó demasiado en responder. Intenta nuevamente en unos minutos.",
      504,
    );
  }

  const status = statusFromError(error);
  if (status === 429) {
    return errorResponse(
      "quota_exceeded",
      "El tutor alcanzó temporalmente su límite de uso. Intenta nuevamente más tarde.",
      429,
    );
  }
  if (status === 503 || status === 504) {
    return errorResponse(
      "temporarily_unavailable",
      "El tutor no está disponible temporalmente. Intenta nuevamente en unos minutos.",
      503,
    );
  }

  return errorResponse(
    "internal_error",
    "No fue posible consultar al tutor en este momento.",
    500,
  );
}

function validateRequestBody(value: unknown): RagAssistantRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).some((key) => !allowedRequestKeys.has(key))) return null;

  if (typeof record.question !== "string" || typeof record.courseSlug !== "string") return null;
  const question = record.question.trim();
  const courseSlug = record.courseSlug.trim();
  if (!question || question.length > RAG_ASSISTANT_MAX_QUESTION_LENGTH) return null;
  if (courseSlug !== courseSeed.slug) return null;

  const rawModuleSlug = record.moduleSlug;
  if (rawModuleSlug !== undefined && rawModuleSlug !== null && typeof rawModuleSlug !== "string") {
    return null;
  }
  const moduleSlug = typeof rawModuleSlug === "string" ? rawModuleSlug.trim() : null;
  if (moduleSlug && !allowedModuleSlugs.has(moduleSlug)) return null;

  return { question, courseSlug, moduleSlug };
}

function toPublicSource(source: RagAnswerSource): RagAnswerSource {
  return {
    id: source.id,
    moduleNumber: source.moduleNumber,
    moduleTitle: source.moduleTitle,
    sectionTitle: source.sectionTitle,
    subsectionTitle: source.subsectionTitle,
    pageStart: source.pageStart,
    pageEnd: source.pageEnd,
    routePath: source.routePath,
    similarity: source.similarity,
  };
}

function toPublicAnswer(answer: GroundedRagAnswer): GroundedRagAnswer {
  return {
    status: answer.status,
    answer: answer.status === "answered" ? answer.answer : null,
    sources: answer.status === "answered" ? answer.sources.map(toPublicSource) : [],
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new RagAssistantTimeoutError()), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export function assistantNotAvailableResponse() {
  return errorResponse(
    "not_available",
    "El tutor local no está habilitado en este entorno.",
    404,
  );
}

export async function handleAssistantRequest(
  request: Request,
  dependencies: AssistantHandlerDependencies,
) {
  if (request.method !== "POST") {
    const response = errorResponse(
      "method_not_allowed",
      "Este recurso solo acepta solicitudes POST.",
      405,
    );
    response.headers.set("Allow", "POST");
    return response;
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return errorResponse("invalid_request", "La solicitud debe usar JSON válido.", 415);
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BODY_LENGTH) {
    return errorResponse("invalid_request", "La solicitud es demasiado extensa.", 413);
  }

  const rawBody = await request.text();
  if (!rawBody.trim() || rawBody.length > MAX_REQUEST_BODY_LENGTH) {
    return errorResponse("invalid_request", "La solicitud no contiene un JSON válido.", 400);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return errorResponse("invalid_request", "La solicitud no contiene un JSON válido.", 400);
  }

  const input = validateRequestBody(parsed);
  if (!input) {
    return errorResponse(
      "invalid_request",
      `La pregunta, el curso o el módulo no son válidos. La pregunta admite hasta ${RAG_ASSISTANT_MAX_QUESTION_LENGTH} caracteres.`,
      400,
    );
  }

  try {
    const answer = await withTimeout(
      dependencies.answerQuestion(input),
      dependencies.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
    );
    return jsonResponse(toPublicAnswer(answer));
  } catch (error) {
    return publicProviderError(error);
  }
}
