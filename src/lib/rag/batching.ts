import type { RagChunk } from "./corpus";
import {
  embedRagChunks,
  embedRagQueries,
  type RagEmbeddingProvider,
} from "./embedding-provider";

export const DEFAULT_EMBEDDING_BATCH_SIZE = 16;
export const DEFAULT_EMBEDDING_MAX_ATTEMPTS = 5;

type RetryEvent = {
  attempt: number;
  delayMs: number;
  reason: string;
};

type BatchProgress = {
  batchIndex: number;
  batchCount: number;
  itemCount: number;
  processedItems: number;
  totalItems: number;
};

function errorStatus(error: unknown) {
  if (!error || typeof error !== "object") return null;
  const candidate = error as { status?: unknown; code?: unknown };
  const value = candidate.status ?? candidate.code;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 100 && numeric <= 599 ? numeric : null;
}

export function safeErrorSummary(error: unknown) {
  const status = errorStatus(error);
  const message = error instanceof Error ? error.message : String(error);
  const sanitized = message
    .replace(/(?:key|api[_-]?key)=([^&\s]+)/gi, "api_key=[REDACTED]")
    .replace(/\bAIza[\w-]+\b/g, "[REDACTED]")
    .replace(/\bAQ[\w-]{20,}\b/g, "[REDACTED]")
    .replace(/\s+/g, " ")
    .trim();
  return status ? `HTTP ${status}: ${sanitized}` : sanitized;
}

export function isTransientEmbeddingError(error: unknown) {
  const status = errorStatus(error);
  if (status && [408, 409, 425, 429, 500, 502, 503, 504].includes(status)) return true;
  return /rate.?limit|quota|resource.?exhausted|temporar|timeout|timed out|abort(?:ed|error)?|fetch failed|network|econnreset|eai_again/i
    .test(safeErrorSummary(error));
}

export function suggestedRetryDelayMs(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const structured = message.match(/"retryDelay"\s*:\s*"([0-9.]+)s"/i);
  const prose = message.match(/retry in ([0-9.]+)s/i);
  const seconds = Number(structured?.[1] ?? prose?.[1]);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds * 1_000) + 250 : null;
}

export async function withTransientRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    onRetry?: (event: RetryEvent) => void;
  } = {},
) {
  const maxAttempts = options.maxAttempts ?? DEFAULT_EMBEDDING_MAX_ATTEMPTS;
  const baseDelayMs = options.baseDelayMs ?? 1_000;
  const maxDelayMs = options.maxDelayMs ?? 60_000;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= maxAttempts || !isTransientEmbeddingError(error)) throw error;
      const exponentialDelay = baseDelayMs * 2 ** (attempt - 1);
      const serverDelay = suggestedRetryDelayMs(error) ?? 0;
      if (serverDelay > maxDelayMs) throw error;
      const delayMs = Math.min(maxDelayMs, Math.max(exponentialDelay, serverDelay));
      options.onRetry?.({ attempt, delayMs, reason: safeErrorSummary(error) });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error("Se agotaron los reintentos de embeddings.");
}

async function embedInBatches<T>(options: {
  items: T[];
  batchSize?: number;
  embedBatch: (items: T[]) => Promise<number[][]>;
  onBatchComplete?: (progress: BatchProgress) => void;
  onRetry?: (event: RetryEvent & { batchIndex: number; batchCount: number }) => void;
}) {
  const batchSize = options.batchSize ?? DEFAULT_EMBEDDING_BATCH_SIZE;
  if (!Number.isInteger(batchSize) || batchSize <= 0) {
    throw new Error("El tamaño de lote de embeddings debe ser un entero positivo.");
  }

  const batches = Array.from(
    { length: Math.ceil(options.items.length / batchSize) },
    (_, index) => options.items.slice(index * batchSize, (index + 1) * batchSize),
  );
  const embeddings: number[][] = [];

  for (const [batchIndex, batch] of batches.entries()) {
    const batchEmbeddings = await withTransientRetry(
      () => options.embedBatch(batch),
      {
        onRetry: (event) => options.onRetry?.({
          ...event,
          batchIndex,
          batchCount: batches.length,
        }),
      },
    );
    embeddings.push(...batchEmbeddings);
    options.onBatchComplete?.({
      batchIndex,
      batchCount: batches.length,
      itemCount: batch.length,
      processedItems: embeddings.length,
      totalItems: options.items.length,
    });
  }

  return embeddings;
}

export function embedRagChunksInBatches(options: {
  provider: RagEmbeddingProvider;
  chunks: RagChunk[];
  batchSize?: number;
  onBatchComplete?: (progress: BatchProgress) => void;
  onRetry?: (event: RetryEvent & { batchIndex: number; batchCount: number }) => void;
}) {
  return embedInBatches({
    items: options.chunks,
    batchSize: options.batchSize,
    embedBatch: (chunks) => embedRagChunks(options.provider, chunks),
    onBatchComplete: options.onBatchComplete,
    onRetry: options.onRetry,
  });
}

export function embedRagQueriesInBatches(options: {
  provider: RagEmbeddingProvider;
  queries: string[];
  batchSize?: number;
  onBatchComplete?: (progress: BatchProgress) => void;
  onRetry?: (event: RetryEvent & { batchIndex: number; batchCount: number }) => void;
}) {
  return embedInBatches({
    items: options.queries,
    batchSize: options.batchSize,
    embedBatch: (queries) => embedRagQueries(options.provider, queries),
    onBatchComplete: options.onBatchComplete,
    onRetry: options.onRetry,
  });
}
