import type { RagChunk } from "./corpus";

export const RAG_QUERY_TASK = "question answering";

export function prepareRagDocumentText(title: string, content: string) {
  const normalizedTitle = title.trim() || "none";
  return `title: ${normalizedTitle} | text: ${content.trim()}`;
}

export function prepareRagQueryText(query: string) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) throw new Error("La consulta RAG no puede estar vacía.");
  return `task: ${RAG_QUERY_TASK} | query: ${normalizedQuery}`;
}

export function getRagChunkEmbeddingTitle(chunk: RagChunk) {
  return [
    chunk.moduleTitle ?? chunk.documentTitle,
    chunk.subsectionTitle ?? chunk.sectionTitle,
  ].filter(Boolean).join(" — ");
}
