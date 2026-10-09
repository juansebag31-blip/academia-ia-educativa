import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RagEmbeddingProvider } from "./embedding-provider";
import type { RagGenerationProvider } from "./generation-provider";
import { generateGroundedRagAnswer } from "./grounded-answer";
import { searchRagChunks } from "./retrieval";

export const DEFAULT_RAG_RETRIEVAL_TOP_K = 8;

export async function answerRagQuestion(options: {
  admin: SupabaseClient;
  embeddingProvider: RagEmbeddingProvider;
  generationProvider: RagGenerationProvider;
  question: string;
  courseSlug: string;
  moduleSlug?: string | null;
  filterByModule?: boolean;
  threshold: number;
  topK?: number;
  maxContextChunks?: number;
}) {
  const retrievalResults = await searchRagChunks({
    admin: options.admin,
    provider: options.embeddingProvider,
    query: options.question,
    courseSlug: options.courseSlug,
    // The API carries module context now, but retrieval remains course-wide
    // until a soft-preference strategy is calibrated with learner questions.
    moduleSlug: options.filterByModule ? options.moduleSlug : null,
    matchCount: options.topK ?? DEFAULT_RAG_RETRIEVAL_TOP_K,
  });

  return generateGroundedRagAnswer({
    question: options.question,
    retrievalResults,
    generationProvider: options.generationProvider,
    threshold: options.threshold,
    maxContextChunks: options.maxContextChunks,
  });
}
