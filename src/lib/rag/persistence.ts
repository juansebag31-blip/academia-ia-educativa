import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "../supabase/admin";
import type { RagChunk } from "./corpus";
import {
  RAG_EMBEDDING_DIMENSIONS,
  RAG_EMBEDDING_MODEL,
  assertRagEmbedding,
} from "./embedding-provider";
import { requireRagSupabaseEnvironment } from "./server-config";

export function createRagAdminClient() {
  requireRagSupabaseEnvironment();
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("No se pudo crear el cliente administrativo de Supabase.");
  return admin;
}

export async function persistRagChunkEmbedding(
  admin: SupabaseClient,
  chunk: RagChunk,
  embedding: number[],
) {
  assertRagEmbedding(embedding);

  const { data: document, error: documentError } = await admin
    .from("rag_documents")
    .upsert({
      corpus_version: chunk.corpusVersion,
      course_slug: chunk.courseSlug,
      course_title: chunk.courseTitle,
      document_title: chunk.documentTitle,
      source_file: chunk.sourceFile,
      source_kind: chunk.sourceKind,
      source_sha256: chunk.sourceSha256,
      route_path: chunk.routePath,
      updated_at: new Date().toISOString(),
    }, { onConflict: "course_slug,source_file,source_kind" })
    .select("id")
    .single();

  if (documentError || !document) {
    throw new Error(`No se pudo persistir el documento RAG: ${documentError?.message ?? "respuesta vacía"}.`);
  }

  const { data: storedChunk, error: chunkError } = await admin
    .from("rag_chunks")
    .upsert({
      document_id: document.id,
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
      embedding_model: RAG_EMBEDDING_MODEL,
      embedding_dimensions: RAG_EMBEDDING_DIMENSIONS,
      embedding,
      updated_at: new Date().toISOString(),
    }, { onConflict: "course_slug,source_file,chunk_index" })
    .select("id")
    .single();

  if (chunkError || !storedChunk) {
    throw new Error(`No se pudo persistir el chunk RAG: ${chunkError?.message ?? "respuesta vacía"}.`);
  }

  return { documentId: document.id as string, chunkId: storedChunk.id as string };
}
