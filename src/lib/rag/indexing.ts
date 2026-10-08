import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RagChunk, RagCorpusFile } from "./corpus";
import { RAG_EMBEDDING_DIMENSIONS, RAG_EMBEDDING_MODEL } from "./embedding-provider";
import {
  type ExistingRagChunk,
  type ExistingRagDocument,
  ragDocumentStableKey,
} from "./indexing-plan";

const EXISTING_CHUNK_SELECT = [
  "id",
  "document_id",
  "corpus_version",
  "chunking_version",
  "course_slug",
  "course_title",
  "module_slug",
  "module_number",
  "module_title",
  "section_path",
  "section_title",
  "subsection_title",
  "document_title",
  "source_file",
  "source_kind",
  "source_sha256",
  "page_start",
  "page_end",
  "chunk_index",
  "content_sha256",
  "character_count",
  "word_count",
  "language",
  "route_path",
  "embedding_model",
  "embedding_dimensions",
].join(",");

function chunkMetadataPayload(chunk: RagChunk, documentId: string) {
  return {
    document_id: documentId,
    corpus_version: chunk.corpusVersion,
    chunking_version: chunk.chunkingVersion,
    course_slug: chunk.courseSlug,
    course_title: chunk.courseTitle,
    module_slug: chunk.moduleSlug,
    module_number: chunk.moduleNumber,
    module_title: chunk.moduleTitle,
    section_path: chunk.sectionPath,
    section_title: chunk.sectionTitle,
    subsection_title: chunk.subsectionTitle,
    document_title: chunk.documentTitle,
    source_file: chunk.sourceFile,
    source_kind: chunk.sourceKind,
    source_sha256: chunk.sourceSha256,
    page_start: chunk.pageStart,
    page_end: chunk.pageEnd,
    chunk_index: chunk.chunkIndex,
    content: chunk.content,
    content_sha256: chunk.contentSha256,
    character_count: chunk.characterCount,
    word_count: chunk.wordCount,
    language: chunk.language,
    route_path: chunk.routePath,
    updated_at: new Date().toISOString(),
  };
}

export async function loadRagIndexState(admin: SupabaseClient, courseSlug: string) {
  const [documentsResult, chunksResult] = await Promise.all([
    admin
      .from("rag_documents")
      .select("id,course_slug,source_file,source_kind")
      .eq("course_slug", courseSlug),
    admin
      .from("rag_chunks")
      .select(EXISTING_CHUNK_SELECT)
      .eq("course_slug", courseSlug)
      .order("source_file")
      .order("chunk_index"),
  ]);

  if (documentsResult.error) {
    throw new Error(`No se pudo leer rag_documents: ${documentsResult.error.message}.`);
  }
  if (chunksResult.error) {
    throw new Error(`No se pudo leer rag_chunks: ${chunksResult.error.message}.`);
  }

  return {
    documents: (documentsResult.data ?? []) as ExistingRagDocument[],
    chunks: (chunksResult.data ?? []) as unknown as ExistingRagChunk[],
  };
}

export async function upsertRagDocuments(admin: SupabaseClient, corpus: RagCorpusFile) {
  const documentsByKey = new Map<string, RagChunk>();
  for (const chunk of corpus.chunks) {
    documentsByKey.set(ragDocumentStableKey(chunk), chunk);
  }

  const { data, error } = await admin
    .from("rag_documents")
    .upsert(
      [...documentsByKey.values()].map((chunk) => ({
        corpus_version: chunk.corpusVersion,
        course_slug: chunk.courseSlug,
        course_title: chunk.courseTitle,
        document_title: chunk.documentTitle,
        source_file: chunk.sourceFile,
        source_kind: chunk.sourceKind,
        source_sha256: chunk.sourceSha256,
        route_path: chunk.routePath,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "course_slug,source_file,source_kind" },
    )
    .select("id,course_slug,source_file,source_kind");

  if (error) throw new Error(`No se pudieron reconciliar los documentos RAG: ${error.message}.`);
  const documents = (data ?? []) as ExistingRagDocument[];
  return new Map(documents.map((document) => [
    `${document.source_kind}\u0000${document.source_file}`,
    document.id,
  ]));
}

export async function updateReusedRagChunkMetadata(
  admin: SupabaseClient,
  options: { id: string; chunk: RagChunk; documentId: string },
) {
  const { error } = await admin
    .from("rag_chunks")
    .update(chunkMetadataPayload(options.chunk, options.documentId))
    .eq("id", options.id);
  if (error) {
    throw new Error(`No se pudo actualizar metadata de ${options.chunk.sourceFile}#${options.chunk.chunkIndex}: ${error.message}.`);
  }
}

export async function upsertRagChunkEmbeddings(
  admin: SupabaseClient,
  items: Array<{ chunk: RagChunk; documentId: string; embedding: number[] }>,
) {
  if (items.length === 0) return;
  const { error } = await admin.from("rag_chunks").upsert(
    items.map(({ chunk, documentId, embedding }) => ({
      ...chunkMetadataPayload(chunk, documentId),
      embedding_model: RAG_EMBEDDING_MODEL,
      embedding_dimensions: RAG_EMBEDDING_DIMENSIONS,
      embedding,
    })),
    { onConflict: "course_slug,source_file,chunk_index" },
  );
  if (error) throw new Error(`No se pudieron persistir embeddings RAG: ${error.message}.`);
}

async function deleteIds(
  admin: SupabaseClient,
  table: "rag_chunks" | "rag_documents",
  ids: string[],
) {
  for (let index = 0; index < ids.length; index += 50) {
    const batch = ids.slice(index, index + 50);
    const { error } = await admin.from(table).delete().in("id", batch);
    if (error) throw new Error(`No se pudieron eliminar filas obsoletas de ${table}: ${error.message}.`);
  }
}

export async function deleteStaleRagRows(
  admin: SupabaseClient,
  options: { staleChunkIds: string[]; staleDocumentIds: string[] },
) {
  await deleteIds(admin, "rag_chunks", options.staleChunkIds);
  await deleteIds(admin, "rag_documents", options.staleDocumentIds);
}

export function staleRagDocumentIds(
  corpus: RagCorpusFile,
  existingDocuments: ExistingRagDocument[],
) {
  const active = new Set(corpus.chunks.map(ragDocumentStableKey));
  return existingDocuments
    .filter((document) => !active.has(`${document.source_kind}\u0000${document.source_file}`))
    .map((document) => document.id);
}
