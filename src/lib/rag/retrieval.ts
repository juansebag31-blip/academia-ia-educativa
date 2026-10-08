import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { embedRagQuery, type RagEmbeddingProvider } from "./embedding-provider";

export type RagSearchResult = {
  chunkId: string;
  documentId: string;
  content: string;
  courseSlug: string;
  courseTitle: string;
  moduleSlug: string | null;
  moduleNumber: number | null;
  moduleTitle: string | null;
  sectionPath: string[];
  sectionTitle: string | null;
  subsectionTitle: string | null;
  documentTitle: string;
  sourceFile: string;
  sourceKind: "module_pdf" | "program_overview";
  sourceSha256: string;
  pageStart: number;
  pageEnd: number;
  chunkIndex: number;
  wordCount: number;
  contentSha256: string;
  routePath: string | null;
  similarity: number;
};

type RagSearchRow = {
  chunk_id: string;
  document_id: string;
  content: string;
  course_slug: string;
  course_title: string;
  module_slug: string | null;
  module_number: number | null;
  module_title: string | null;
  section_path: string[];
  section_title: string | null;
  subsection_title: string | null;
  document_title: string;
  source_file: string;
  source_kind: "module_pdf" | "program_overview";
  source_sha256: string;
  page_start: number;
  page_end: number;
  chunk_index: number;
  word_count: number;
  content_sha256: string;
  route_path: string | null;
  similarity: number;
};

export async function searchRagChunks(options: {
  admin: SupabaseClient;
  provider: RagEmbeddingProvider;
  query: string;
  courseSlug: string;
  moduleSlug?: string | null;
  matchCount?: number;
}) {
  const queryEmbedding = await embedRagQuery(options.provider, options.query);
  return searchRagChunksByEmbedding({
    admin: options.admin,
    queryEmbedding,
    courseSlug: options.courseSlug,
    moduleSlug: options.moduleSlug,
    matchCount: options.matchCount,
  });
}

export async function searchRagChunksByEmbedding(options: {
  admin: SupabaseClient;
  queryEmbedding: number[];
  courseSlug: string;
  moduleSlug?: string | null;
  matchCount?: number;
}) {
  const { data, error } = await options.admin.rpc("match_rag_chunks", {
    p_query_embedding: options.queryEmbedding,
    p_course_slug: options.courseSlug,
    p_module_slug: options.moduleSlug ?? null,
    p_match_count: options.matchCount ?? 10,
  });

  if (error) throw new Error(`La búsqueda vectorial falló: ${error.message}.`);

  return ((data ?? []) as RagSearchRow[]).map((row): RagSearchResult => ({
    chunkId: row.chunk_id,
    documentId: row.document_id,
    content: row.content,
    courseSlug: row.course_slug,
    courseTitle: row.course_title,
    moduleSlug: row.module_slug,
    moduleNumber: row.module_number,
    moduleTitle: row.module_title,
    sectionPath: row.section_path,
    sectionTitle: row.section_title,
    subsectionTitle: row.subsection_title,
    documentTitle: row.document_title,
    sourceFile: row.source_file,
    sourceKind: row.source_kind,
    sourceSha256: row.source_sha256,
    pageStart: row.page_start,
    pageEnd: row.page_end,
    chunkIndex: row.chunk_index,
    wordCount: row.word_count,
    contentSha256: row.content_sha256,
    routePath: row.route_path,
    similarity: Number(row.similarity),
  }));
}
