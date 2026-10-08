import { createHash } from "node:crypto";

export const RAG_CORPUS_VERSION = "academia-ia-educativa-rag-v1";
export const RAG_CHUNKING_VERSION = "semantic-sections-v1";

export type RagSourceKind = "module_pdf" | "program_overview";
export type RagBlockKind = "heading" | "subheading" | "paragraph" | "list" | "table";

export type RagBlock = {
  pageNumber: number;
  kind: RagBlockKind;
  text: string;
};

export type RagDocumentInput = {
  courseSlug: string;
  courseTitle: string;
  moduleSlug: string | null;
  moduleNumber: number | null;
  moduleTitle: string | null;
  documentTitle: string;
  sourceFile: string;
  sourceKind: RagSourceKind;
  sourceSha256: string;
  routePath: string | null;
  blocks: RagBlock[];
};

export type RagChunk = {
  corpusVersion: string;
  chunkingVersion: string;
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
  sourceKind: RagSourceKind;
  sourceSha256: string;
  pageStart: number;
  pageEnd: number;
  chunkIndex: number;
  content: string;
  contentSha256: string;
  characterCount: number;
  wordCount: number;
  language: "es";
  routePath: string | null;
};

export type RagDocumentReport = {
  sourceFile: string;
  sourceKind: RagSourceKind;
  moduleSlug: string | null;
  pagesRead: number;
  pagesIncluded: number;
  wordsIncluded: number;
  blocksIncluded: number;
  chunksCreated: number;
  exactDuplicatesRemoved: number;
  nearDuplicatesRemoved: number;
  warnings: string[];
};

export type RagCorpusSummary = {
  documentsProcessed: number;
  pagesRead: number;
  pagesIncluded: number;
  words: number;
  chunks: number;
  chunkWords: {
    minimum: number;
    mean: number;
    median: number;
    maximum: number;
  };
  chunksByModule: Record<string, number>;
  programOverviewChunks: number;
  exactDuplicatesRemoved: number;
  nearDuplicatesRemoved: number;
  duplicateBookPagesExcluded: number;
  nonCanonicalBookPagesExcluded: number;
  warnings: string[];
};

export type RagCorpusFile = {
  corpusVersion: string;
  chunkingVersion: string;
  summary: RagCorpusSummary;
  documents: RagDocumentReport[];
  chunks: RagChunk[];
};

type SemanticUnit = {
  sectionTitle: string | null;
  subsectionTitle: string | null;
  sectionPath: string[];
  blocks: RagBlock[];
};

type ChunkDraft = {
  blocks: RagBlock[];
  sectionTitle: string | null;
  subsectionTitle: string | null;
  sectionPath: string[];
};

const TARGET_MIN_WORDS = 350;
const TARGET_MAX_WORDS = 550;
const SOFT_MAX_WORDS = 700;
const OVERLAP_MIN_WORDS = 50;
const OVERLAP_MAX_WORDS = 80;

export function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizeWhitespace(value: string) {
  return value
    .replace(/\u00ad/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

export function normalizeForComparison(value: string) {
  return normalizeWhitespace(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function countWords(value: string) {
  return value.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
}

export function buildRagChunks(document: RagDocumentInput) {
  const units = buildSemanticUnits(document);
  const drafts = units.flatMap(splitSemanticUnit);

  return drafts.map((draft, chunkIndex) => {
    const content = composeChunkContent(draft);
    const pages = draft.blocks.map((block) => block.pageNumber);

    return {
      corpusVersion: RAG_CORPUS_VERSION,
      chunkingVersion: RAG_CHUNKING_VERSION,
      courseSlug: document.courseSlug,
      courseTitle: document.courseTitle,
      moduleSlug: document.moduleSlug,
      moduleNumber: document.moduleNumber,
      moduleTitle: document.moduleTitle,
      sectionPath: draft.sectionPath,
      sectionTitle: draft.sectionTitle,
      subsectionTitle: draft.subsectionTitle,
      documentTitle: document.documentTitle,
      sourceFile: document.sourceFile,
      sourceKind: document.sourceKind,
      sourceSha256: document.sourceSha256,
      pageStart: Math.min(...pages),
      pageEnd: Math.max(...pages),
      chunkIndex,
      content,
      contentSha256: sha256(normalizeForComparison(content)),
      characterCount: content.length,
      wordCount: countWords(content),
      language: "es" as const,
      routePath: document.routePath,
    } satisfies RagChunk;
  });
}

function buildSemanticUnits(document: RagDocumentInput) {
  const fallbackTitle = document.sourceKind === "program_overview"
    ? "Presentación general del programa"
    : "Presentación del módulo";
  const units: SemanticUnit[] = [];
  let sectionTitle: string | null = fallbackTitle;
  let subsectionTitle: string | null = null;
  let blocks: RagBlock[] = [];

  const flush = () => {
    if (blocks.length === 0) return;
    units.push({
      sectionTitle,
      subsectionTitle,
      sectionPath: [sectionTitle, subsectionTitle].filter((value): value is string => Boolean(value)),
      blocks,
    });
    blocks = [];
  };

  for (const block of document.blocks) {
    if (block.kind === "heading") {
      flush();
      sectionTitle = block.text;
      subsectionTitle = null;
      continue;
    }

    if (block.kind === "subheading") {
      flush();
      subsectionTitle = block.text;
      continue;
    }

    blocks.push(block);
  }

  flush();
  return mergeSmallSemanticUnits(units);
}

function mergeSmallSemanticUnits(units: SemanticUnit[]) {
  const merged: SemanticUnit[] = [];

  for (const unit of units) {
    const previous = merged.at(-1);
    const unitWords = unit.blocks.reduce((sum, block) => sum + countWords(block.text), 0);
    const previousWords = previous
      ? previous.blocks.reduce((sum, block) => sum + countWords(block.text), 0)
      : 0;
    const sameTopLevelSection = previous?.sectionTitle === unit.sectionTitle;
    const canMerge = previous
      && sameTopLevelSection
      && (unitWords < 80 || previousWords < 80)
      && unitWords + previousWords <= SOFT_MAX_WORDS;

    if (!canMerge || !previous) {
      merged.push({ ...unit, blocks: [...unit.blocks] });
      continue;
    }

    if (unit.subsectionTitle && unit.subsectionTitle !== previous.subsectionTitle) {
      previous.blocks.push({
        pageNumber: unit.blocks[0]?.pageNumber ?? previous.blocks.at(-1)?.pageNumber ?? 1,
        kind: "paragraph",
        text: unit.subsectionTitle,
      });
    }
    previous.blocks.push(...unit.blocks);
    previous.subsectionTitle = null;
    previous.sectionPath = [previous.sectionTitle].filter((value): value is string => Boolean(value));
  }

  return merged;
}

function splitSemanticUnit(unit: SemanticUnit): ChunkDraft[] {
  const preparedBlocks = unit.blocks.flatMap(splitOversizedBlock);
  const totalWords = preparedBlocks.reduce((sum, block) => sum + countWords(block.text), 0);

  if (totalWords <= SOFT_MAX_WORDS) {
    return [{ ...unit, blocks: preparedBlocks }];
  }

  const chunks: ChunkDraft[] = [];
  let current: RagBlock[] = [];

  const flush = () => {
    if (current.length === 0) return;
    chunks.push({ ...unit, blocks: current });
    current = [];
  };

  for (const block of preparedBlocks) {
    const currentWords = current.reduce((sum, item) => sum + countWords(item.text), 0);
    const blockWords = countWords(block.text);
    const projectedWords = currentWords + blockWords;

    if (
      current.length > 0
      && currentWords >= TARGET_MIN_WORDS
      && (projectedWords > TARGET_MAX_WORDS || projectedWords > SOFT_MAX_WORDS)
    ) {
      const previous = [...current];
      flush();
      current = [...buildOverlap(previous), block];
      continue;
    }

    if (current.length > 0 && projectedWords > SOFT_MAX_WORDS) {
      const previous = [...current];
      flush();
      current = [...buildOverlap(previous), block];
      continue;
    }

    current.push(block);
  }

  flush();
  return chunks;
}

function splitOversizedBlock(block: RagBlock) {
  if (countWords(block.text) <= SOFT_MAX_WORDS) return [block];

  const sentences = block.text
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length < 2) {
    return splitByWords(block, TARGET_MAX_WORDS);
  }

  const blocks: RagBlock[] = [];
  let current: string[] = [];
  let currentWords = 0;

  for (const sentence of sentences) {
    const sentenceWords = countWords(sentence);
    if (currentWords >= TARGET_MIN_WORDS && currentWords + sentenceWords > TARGET_MAX_WORDS) {
      blocks.push({ ...block, text: current.join(" ") });
      current = [];
      currentWords = 0;
    }
    current.push(sentence);
    currentWords += sentenceWords;
  }

  if (current.length > 0) blocks.push({ ...block, text: current.join(" ") });
  return blocks;
}

function splitByWords(block: RagBlock, size: number) {
  const words = block.text.split(/\s+/);
  const blocks: RagBlock[] = [];
  for (let index = 0; index < words.length; index += size) {
    blocks.push({ ...block, text: words.slice(index, index + size).join(" ") });
  }
  return blocks;
}

function buildOverlap(blocks: RagBlock[]) {
  const last = blocks.at(-1);
  if (!last) return [];

  const lastWords = countWords(last.text);
  if (lastWords >= OVERLAP_MIN_WORDS && lastWords <= OVERLAP_MAX_WORDS) {
    return [last];
  }

  const words = last.text.split(/\s+/);
  if (words.length < OVERLAP_MIN_WORDS) {
    const previous = blocks.at(-2);
    if (previous) {
      const combined = `${previous.text}\n${last.text}`;
      const combinedWords = combined.split(/\s+/);
      return [{
        ...last,
        pageNumber: previous.pageNumber,
        text: combinedWords.slice(-OVERLAP_MAX_WORDS).join(" "),
      }];
    }
    return [last];
  }

  return [{ ...last, text: words.slice(-65).join(" ") }];
}

function composeChunkContent(draft: ChunkDraft) {
  const heading = draft.sectionPath.join("\n");
  const body = draft.blocks
    .map((block) => block.text)
    .join("\n\n")
    .trim();

  return normalizeWhitespace([heading, body].filter(Boolean).join("\n\n"));
}

export function removeDuplicateChunks(chunks: RagChunk[]) {
  const seen = new Set<string>();
  const unique: RagChunk[] = [];
  let removed = 0;

  for (const chunk of chunks) {
    if (seen.has(chunk.contentSha256)) {
      removed += 1;
      continue;
    }
    seen.add(chunk.contentSha256);
    unique.push(chunk);
  }

  return { chunks: unique, removed };
}

export function validateRagCorpus(
  chunks: RagChunk[],
  expectedModules: Array<{
    slug: string;
    order: number;
    title: string;
    pdfFile: string;
  }>,
) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const expectedBySlug = new Map(expectedModules.map((courseModule) => [courseModule.slug, courseModule]));
  const moduleChunks = chunks.filter((chunk) => chunk.sourceKind === "module_pdf");
  const actualModuleSlugs = new Set(moduleChunks.map((chunk) => chunk.moduleSlug));

  for (const courseModule of expectedModules) {
    if (!actualModuleSlugs.has(courseModule.slug)) {
      errors.push(`No se generaron chunks para ${courseModule.slug}.`);
    }
  }

  if (actualModuleSlugs.size !== expectedModules.length || actualModuleSlugs.has(null)) {
    errors.push(`Se esperaban ${expectedModules.length} módulos y se encontraron ${actualModuleSlugs.size}.`);
  }

  const hashes = new Set<string>();
  for (const chunk of chunks) {
    if (!chunk.content.trim()) errors.push(`Chunk vacío: ${chunk.sourceFile}#${chunk.chunkIndex}.`);
    if (chunk.pageStart > chunk.pageEnd) {
      errors.push(`Rango de páginas inválido: ${chunk.sourceFile}#${chunk.chunkIndex}.`);
    }
    if (hashes.has(chunk.contentSha256)) {
      errors.push(`Contenido duplicado: ${chunk.contentSha256}.`);
    }
    hashes.add(chunk.contentSha256);

    if (chunk.sourceKind === "module_pdf") {
      if (!chunk.moduleSlug) {
        errors.push(`Chunk modular sin moduleSlug: ${chunk.sourceFile}#${chunk.chunkIndex}.`);
        continue;
      }
      const expected = expectedBySlug.get(chunk.moduleSlug);
      if (!expected) {
        errors.push(`Módulo desconocido: ${chunk.moduleSlug}.`);
        continue;
      }
      if (
        chunk.sourceFile !== expected.pdfFile
        || chunk.moduleNumber !== expected.order
        || chunk.moduleTitle !== expected.title
      ) {
        errors.push(`Metadata cruzada en ${chunk.sourceFile}#${chunk.chunkIndex}.`);
      }
    } else if (
      chunk.moduleSlug !== null
      || chunk.moduleNumber !== null
      || chunk.moduleTitle !== null
    ) {
      errors.push(`Chunk program_overview asociado accidentalmente a un módulo.`);
    }

    if (chunk.wordCount > SOFT_MAX_WORDS) {
      warnings.push(`Chunk sobre el máximo suave (${chunk.wordCount} palabras): ${chunk.sourceFile}#${chunk.chunkIndex}.`);
    }
  }

  return { errors, warnings };
}

export function calculateChunkWordDistribution(chunks: RagChunk[]) {
  if (chunks.length === 0) {
    return { minimum: 0, mean: 0, median: 0, maximum: 0 };
  }

  const values = chunks.map((chunk) => chunk.wordCount).sort((a, b) => a - b);
  const middle = Math.floor(values.length / 2);
  const median = values.length % 2 === 0
    ? (values[middle - 1] + values[middle]) / 2
    : values[middle];

  return {
    minimum: values[0],
    mean: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)),
    median: Number(median.toFixed(2)),
    maximum: values.at(-1) ?? 0,
  };
}
