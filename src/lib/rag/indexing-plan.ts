import type { RagChunk, RagSourceKind } from "./corpus";
import { RAG_EMBEDDING_DIMENSIONS, RAG_EMBEDDING_MODEL } from "./embedding-provider";

export type ExistingRagDocument = {
  id: string;
  course_slug: string;
  source_file: string;
  source_kind: RagSourceKind;
};

export type ExistingRagChunk = {
  id: string;
  document_id: string;
  corpus_version: string;
  chunking_version: string;
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
  source_kind: RagSourceKind;
  source_sha256: string;
  page_start: number;
  page_end: number;
  chunk_index: number;
  content_sha256: string;
  character_count: number;
  word_count: number;
  language: string;
  route_path: string | null;
  embedding_model: string;
  embedding_dimensions: number;
};

export type RagIndexPlanEntry = {
  chunk: RagChunk;
  existing: ExistingRagChunk | null;
  action: "create" | "reuse" | "update";
  metadataChanged: boolean;
};

export function ragDocumentStableKey(value: Pick<RagChunk, "sourceFile" | "sourceKind">) {
  return `${value.sourceKind}\u0000${value.sourceFile}`;
}

export function ragChunkStableKey(value: Pick<RagChunk, "sourceFile" | "chunkIndex">) {
  return `${value.sourceFile}\u0000${value.chunkIndex}`;
}

export function existingRagChunkStableKey(
  value: Pick<ExistingRagChunk, "source_file" | "chunk_index">,
) {
  return `${value.source_file}\u0000${value.chunk_index}`;
}

function arraysEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function ragChunkMetadataMatches(existing: ExistingRagChunk, chunk: RagChunk) {
  return existing.corpus_version === chunk.corpusVersion
    && existing.chunking_version === chunk.chunkingVersion
    && existing.course_slug === chunk.courseSlug
    && existing.course_title === chunk.courseTitle
    && existing.module_slug === chunk.moduleSlug
    && existing.module_number === chunk.moduleNumber
    && existing.module_title === chunk.moduleTitle
    && arraysEqual(existing.section_path, chunk.sectionPath)
    && existing.section_title === chunk.sectionTitle
    && existing.subsection_title === chunk.subsectionTitle
    && existing.document_title === chunk.documentTitle
    && existing.source_file === chunk.sourceFile
    && existing.source_kind === chunk.sourceKind
    && existing.source_sha256 === chunk.sourceSha256
    && existing.page_start === chunk.pageStart
    && existing.page_end === chunk.pageEnd
    && existing.chunk_index === chunk.chunkIndex
    && existing.content_sha256 === chunk.contentSha256
    && existing.character_count === chunk.characterCount
    && existing.word_count === chunk.wordCount
    && existing.language === chunk.language
    && existing.route_path === chunk.routePath;
}

export function planRagIndexing(chunks: RagChunk[], existingChunks: ExistingRagChunk[]) {
  const existingByStableKey = new Map(
    existingChunks.map((chunk) => [existingRagChunkStableKey(chunk), chunk]),
  );
  const activeStableKeys = new Set(chunks.map(ragChunkStableKey));

  const entries: RagIndexPlanEntry[] = chunks.map((chunk) => {
    const existing = existingByStableKey.get(ragChunkStableKey(chunk)) ?? null;
    if (!existing) {
      return { chunk, existing, action: "create", metadataChanged: true };
    }

    const embeddingMatches = existing.content_sha256 === chunk.contentSha256
      && existing.embedding_model === RAG_EMBEDDING_MODEL
      && existing.embedding_dimensions === RAG_EMBEDDING_DIMENSIONS;
    return {
      chunk,
      existing,
      action: embeddingMatches ? "reuse" : "update",
      metadataChanged: !ragChunkMetadataMatches(existing, chunk),
    };
  });

  return {
    entries,
    staleChunkIds: existingChunks
      .filter((chunk) => !activeStableKeys.has(existingRagChunkStableKey(chunk)))
      .map((chunk) => chunk.id),
    created: entries.filter((entry) => entry.action === "create").length,
    reused: entries.filter((entry) => entry.action === "reuse").length,
    updated: entries.filter((entry) => entry.action === "update").length,
  };
}

export function verifyIndexedCorpus(chunks: RagChunk[], indexed: ExistingRagChunk[]) {
  const errors: string[] = [];
  const expectedByKey = new Map(chunks.map((chunk) => [ragChunkStableKey(chunk), chunk]));

  if (indexed.length !== chunks.length) {
    errors.push(`Se esperaban ${chunks.length} chunks indexados y se encontraron ${indexed.length}.`);
  }

  for (const row of indexed) {
    const expected = expectedByKey.get(existingRagChunkStableKey(row));
    if (!expected) {
      errors.push(`Chunk remoto fuera del corpus activo: ${row.source_file}#${row.chunk_index}.`);
      continue;
    }
    if (row.content_sha256 !== expected.contentSha256) {
      errors.push(`Hash remoto desactualizado: ${row.source_file}#${row.chunk_index}.`);
    }
    if (
      row.embedding_model !== RAG_EMBEDDING_MODEL
      || row.embedding_dimensions !== RAG_EMBEDDING_DIMENSIONS
    ) {
      errors.push(`Embedding remoto incompatible: ${row.source_file}#${row.chunk_index}.`);
    }
  }

  return errors;
}
