import "server-only";

const requiredSupabaseEnvironment = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
] as const;

const requiredGeminiEnvironment = ["GEMINI_API_KEY"] as const;
const requiredGenerationEnvironment = [
  "GEMINI_RAG_MODEL",
  "RAG_SIMILARITY_THRESHOLD",
] as const;
const requiredAssistantProtectionEnvironment = ["RAG_RATE_LIMIT_SECRET"] as const;

const DEFAULT_RAG_ANONYMOUS_DAILY_LIMIT = 5;
const DEFAULT_RAG_AUTHENTICATED_DAILY_LIMIT = 20;
const DEFAULT_RAG_ANONYMOUS_MINUTE_LIMIT = 2;
const DEFAULT_RAG_AUTHENTICATED_MINUTE_LIMIT = 5;
const DEFAULT_RAG_DAILY_GENERATION_BUDGET = 400;
const DEFAULT_RAG_DAILY_EMBEDDING_BUDGET = 450;
const DEFAULT_RAG_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60;

function getMissingEnvironmentVariables(names: readonly string[]) {
  return names.filter((name) => !process.env[name]?.trim());
}

export function getMissingRagEnvironmentVariables() {
  return getMissingEnvironmentVariables([
    ...requiredSupabaseEnvironment,
    ...requiredGeminiEnvironment,
  ]);
}

export function requireRagSupabaseEnvironment() {
  const missing = getMissingEnvironmentVariables(requiredSupabaseEnvironment);
  if (missing.length > 0) {
    throw new Error(`Faltan variables de Supabase para RAG: ${missing.join(", ")}.`);
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY!.trim(),
  };
}

export function requireRagSmokeEnvironment() {
  const missing = getMissingRagEnvironmentVariables();
  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno para la prueba RAG: ${missing.join(", ")}.`);
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY!.trim(),
    geminiApiKey: process.env.GEMINI_API_KEY!.trim(),
  };
}

function parseSimilarityThreshold(value: string) {
  const threshold = Number(value);
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
    throw new Error("RAG_SIMILARITY_THRESHOLD debe ser un número entre 0 y 1.");
  }
  return threshold;
}

function parsePositiveInteger(name: string, fallback: number) {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`${name} debe ser un entero positivo.`);
  }
  return value;
}

export function requireRagAnswerEnvironment() {
  const missing = getMissingEnvironmentVariables([
    ...requiredSupabaseEnvironment,
    ...requiredGeminiEnvironment,
    ...requiredGenerationEnvironment,
  ]);
  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno para respuestas RAG: ${missing.join(", ")}.`);
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY!.trim(),
    geminiApiKey: process.env.GEMINI_API_KEY!.trim(),
    generationModel: process.env.GEMINI_RAG_MODEL!.trim(),
    similarityThreshold: parseSimilarityThreshold(
      process.env.RAG_SIMILARITY_THRESHOLD!.trim(),
    ),
  };
}

export function requireRagAssistantEnvironment() {
  const missing = getMissingEnvironmentVariables(requiredAssistantProtectionEnvironment);
  if (missing.length > 0) {
    throw new Error(`Faltan variables de protección para el tutor RAG: ${missing.join(", ")}.`);
  }

  return {
    ...requireRagAnswerEnvironment(),
    rateLimitSecret: process.env.RAG_RATE_LIMIT_SECRET!.trim(),
    anonymousDailyLimit: parsePositiveInteger(
      "RAG_ANONYMOUS_DAILY_LIMIT",
      DEFAULT_RAG_ANONYMOUS_DAILY_LIMIT,
    ),
    authenticatedDailyLimit: parsePositiveInteger(
      "RAG_AUTHENTICATED_DAILY_LIMIT",
      DEFAULT_RAG_AUTHENTICATED_DAILY_LIMIT,
    ),
    anonymousMinuteLimit: parsePositiveInteger(
      "RAG_ANONYMOUS_MINUTE_LIMIT",
      DEFAULT_RAG_ANONYMOUS_MINUTE_LIMIT,
    ),
    authenticatedMinuteLimit: parsePositiveInteger(
      "RAG_AUTHENTICATED_MINUTE_LIMIT",
      DEFAULT_RAG_AUTHENTICATED_MINUTE_LIMIT,
    ),
    dailyGenerationBudget: parsePositiveInteger(
      "RAG_DAILY_GENERATION_BUDGET",
      DEFAULT_RAG_DAILY_GENERATION_BUDGET,
    ),
    dailyEmbeddingBudget: parsePositiveInteger(
      "RAG_DAILY_EMBEDDING_BUDGET",
      DEFAULT_RAG_DAILY_EMBEDDING_BUDGET,
    ),
    cacheTtlSeconds: parsePositiveInteger(
      "RAG_CACHE_TTL_SECONDS",
      DEFAULT_RAG_CACHE_TTL_SECONDS,
    ),
  };
}
