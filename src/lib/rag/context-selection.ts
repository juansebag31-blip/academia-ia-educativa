import { normalizeForComparison } from "./corpus";
import type { RagSearchResult } from "./retrieval";

export const DEFAULT_RAG_MAX_CONTEXT_CHUNKS = 5;
export const DEFAULT_RAG_CONTEXT_SIMILARITY_DROP = 0.12;
const NEAR_DUPLICATE_THRESHOLD = 0.84;

export type SelectedRagContext = {
  id: string;
  result: RagSearchResult;
};

function contentTokens(content: string) {
  return new Set(
    normalizeForComparison(content)
      .split(/\s+/)
      .filter((token) => token.length >= 4),
  );
}

function lexicalOverlap(left: RagSearchResult, right: RagSearchResult) {
  const leftTokens = contentTokens(left.content);
  const rightTokens = contentTokens(right.content);
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) intersection += 1;
  }
  return intersection / Math.min(leftTokens.size, rightTokens.size);
}

function isDuplicateCandidate(candidate: RagSearchResult, selected: RagSearchResult[]) {
  return selected.some((existing) =>
    existing.contentSha256 === candidate.contentSha256
    || lexicalOverlap(existing, candidate) >= NEAR_DUPLICATE_THRESHOLD);
}

export function selectRagContext(
  results: RagSearchResult[],
  options: {
    maxChunks?: number;
    maxSimilarityDrop?: number;
  } = {},
) {
  const maxChunks = options.maxChunks ?? DEFAULT_RAG_MAX_CONTEXT_CHUNKS;
  const maxSimilarityDrop = options.maxSimilarityDrop
    ?? DEFAULT_RAG_CONTEXT_SIMILARITY_DROP;
  if (!Number.isInteger(maxChunks) || maxChunks < 1 || maxChunks > 5) {
    throw new Error("La selección de contexto debe contener entre 1 y 5 chunks.");
  }
  if (!Number.isFinite(maxSimilarityDrop) || maxSimilarityDrop < 0 || maxSimilarityDrop > 1) {
    throw new Error("La caída máxima de similitud debe estar entre 0 y 1.");
  }

  const ranked = [...results].sort((left, right) => right.similarity - left.similarity);
  const topSimilarity = ranked[0]?.similarity;
  if (topSimilarity === undefined) return [];
  const minimumSimilarity = topSimilarity - maxSimilarityDrop;
  const selected: RagSearchResult[] = [];

  for (const result of ranked) {
    if (selected.length >= maxChunks) break;
    if (result.similarity < minimumSimilarity) continue;
    if (isDuplicateCandidate(result, selected)) continue;
    selected.push(result);
  }

  return selected.map((result, index): SelectedRagContext => ({
    id: `S${index + 1}`,
    result,
  }));
}
