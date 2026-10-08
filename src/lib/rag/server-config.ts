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
