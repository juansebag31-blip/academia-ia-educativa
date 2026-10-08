import type { RagChunk } from "./corpus";
import {
  getRagChunkEmbeddingTitle,
  prepareRagDocumentText,
  prepareRagQueryText,
} from "./embedding-text";

export const RAG_EMBEDDING_MODEL = "gemini-embedding-2";
export const RAG_EMBEDDING_DIMENSIONS = 768;

export interface RagEmbeddingProvider {
  readonly model: string;
  readonly dimensions: number;
  embed(text: string): Promise<number[]>;
  embedMany?(texts: string[]): Promise<number[][]>;
}

export function assertRagEmbedding(embedding: number[]) {
  if (embedding.length !== RAG_EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Embedding inválido: se esperaban ${RAG_EMBEDDING_DIMENSIONS} dimensiones y se recibieron ${embedding.length}.`,
    );
  }
  if (embedding.some((value) => !Number.isFinite(value))) {
    throw new Error("Embedding inválido: contiene valores no finitos.");
  }
  return embedding;
}

export async function embedRagChunk(provider: RagEmbeddingProvider, chunk: RagChunk) {
  const prepared = prepareRagDocumentText(getRagChunkEmbeddingTitle(chunk), chunk.content);
  return assertRagEmbedding(await provider.embed(prepared));
}

export async function embedRagChunks(provider: RagEmbeddingProvider, chunks: RagChunk[]) {
  const prepared = chunks.map((chunk) =>
    prepareRagDocumentText(getRagChunkEmbeddingTitle(chunk), chunk.content));
  const embeddings = provider.embedMany
    ? await provider.embedMany(prepared)
    : await Promise.all(prepared.map((text) => provider.embed(text)));

  if (embeddings.length !== chunks.length) {
    throw new Error(
      `Respuesta de embeddings incompleta: se esperaban ${chunks.length} y se recibieron ${embeddings.length}.`,
    );
  }

  return embeddings.map(assertRagEmbedding);
}

export async function embedRagQuery(provider: RagEmbeddingProvider, query: string) {
  return assertRagEmbedding(await provider.embed(prepareRagQueryText(query)));
}

export async function embedRagQueries(provider: RagEmbeddingProvider, queries: string[]) {
  const prepared = queries.map(prepareRagQueryText);
  const embeddings = provider.embedMany
    ? await provider.embedMany(prepared)
    : await Promise.all(prepared.map((text) => provider.embed(text)));

  if (embeddings.length !== queries.length) {
    throw new Error(
      `Respuesta de embeddings incompleta: se esperaban ${queries.length} y se recibieron ${embeddings.length}.`,
    );
  }

  return embeddings.map(assertRagEmbedding);
}
