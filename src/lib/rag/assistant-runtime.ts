import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { GeminiRagEmbeddingProvider } from "./gemini-embedding-provider";
import { GeminiRagGenerationProvider } from "./gemini-generation-provider";
import type { GroundedRagAnswer, RagAssistantRequest } from "./public-contract";
import { requireRagAnswerEnvironment } from "./server-config";
import { answerRagQuestion } from "./tutor";

export async function answerRagAssistantQuestion(
  request: RagAssistantRequest,
): Promise<GroundedRagAnswer> {
  const config = requireRagAnswerEnvironment();
  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("La configuración server-only de Supabase no está disponible.");
  }

  return answerRagQuestion({
    admin,
    embeddingProvider: new GeminiRagEmbeddingProvider(config.geminiApiKey),
    generationProvider: new GeminiRagGenerationProvider(
      config.geminiApiKey,
      config.generationModel,
    ),
    question: request.question,
    courseSlug: request.courseSlug,
    moduleSlug: request.moduleSlug,
    filterByModule: false,
    threshold: config.similarityThreshold,
  });
}

export function isRagAssistantApiEnabled() {
  const configured = process.env.RAG_ASSISTANT_API_ENABLED?.trim().toLowerCase();
  if (configured === "true") return true;
  if (configured === "false") return false;
  return process.env.NODE_ENV !== "production";
}
