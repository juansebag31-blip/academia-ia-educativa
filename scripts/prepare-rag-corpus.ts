import fs from "node:fs/promises";
import path from "node:path";
import pdf from "pdf-parse";
import { courseSeed } from "../src/lib/course-seed";
import {
  RAG_CHUNKING_VERSION,
  RAG_CORPUS_VERSION,
  buildRagChunks,
  calculateChunkWordDistribution,
  countWords,
  normalizeForComparison,
  normalizeWhitespace,
  removeDuplicateChunks,
  sha256,
  validateRagCorpus,
  type RagBlock,
  type RagCorpusFile,
  type RagDocumentInput,
  type RagDocumentReport,
} from "../src/lib/rag/corpus";

type PdfTextItem = {
  str: string;
  transform: number[];
  width?: number;
  height?: number;
  fontName?: string;
};

type PdfPageData = {
  getTextContent(options: {
    normalizeWhitespace: boolean;
    disableCombineTextItems: boolean;
  }): Promise<{ items: PdfTextItem[] }>;
};

type LayoutLine = {
  pageNumber: number;
  text: string;
  y: number;
  height: number;
  gapBefore: number;
  hasLargeHorizontalGap: boolean;
};

type ExtractedPage = {
  pageNumber: number;
  lines: LayoutLine[];
};

type ExtractedPdf = {
  pages: ExtractedPage[];
  pageCount: number;
  sourceSha256: string;
};

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, "MODULO Y CUADERNILLO");
const outputDir = path.join(projectRoot, "content", "generated");
const outputFile = path.join(outputDir, "rag-chunks.json");
const institutionalFile = "Cuadernillo_Institucional_Programa_IA_Educativa_NotebookLM_COMPLETO.pdf";

// Pages 15-95 reproduce the 11 module PDFs. Pages 8-10 are an index and
// module summaries, while page 1 is only the cover. These ten pages contain
// the exclusive institutional framing requested for the RAG corpus.
const institutionalOverviewPages = new Set([2, 3, 4, 5, 6, 7, 11, 12, 13, 14]);

const checkOnly = process.argv.includes("--check");

async function main() {
  assertCourseMetadata();
  const documentReports: RagDocumentReport[] = [];
  const allChunks = [];

  for (const courseModule of courseSeed.modules) {
    const extracted = await extractPdf(courseModule.pdfFile);
    const cleaned = cleanDocument(extracted.pages, {
      sourceFile: courseModule.pdfFile,
      moduleNumber: courseModule.order,
      moduleTitle: courseModule.title,
    });
    const document: RagDocumentInput = {
      courseSlug: courseSeed.slug,
      courseTitle: courseSeed.title,
      moduleSlug: courseModule.slug,
      moduleNumber: courseModule.order,
      moduleTitle: courseModule.title,
      documentTitle: courseModule.title,
      sourceFile: courseModule.pdfFile,
      sourceKind: "module_pdf",
      sourceSha256: extracted.sourceSha256,
      routePath: `/courses/${courseSeed.slug}/modules/${courseModule.slug}`,
      blocks: cleaned.blocks,
    };
    const chunks = buildRagChunks(document);
    allChunks.push(...chunks);
    documentReports.push({
      sourceFile: courseModule.pdfFile,
      sourceKind: "module_pdf",
      moduleSlug: courseModule.slug,
      pagesRead: extracted.pageCount,
      pagesIncluded: extracted.pageCount,
      wordsIncluded: chunks.reduce((sum, chunk) => sum + chunk.wordCount, 0),
      blocksIncluded: cleaned.blocks.length,
      chunksCreated: chunks.length,
      exactDuplicatesRemoved: cleaned.exactDuplicatesRemoved,
      nearDuplicatesRemoved: cleaned.nearDuplicatesRemoved,
      warnings: cleaned.warnings,
    });
  }

  const institutional = await extractPdf(institutionalFile);
  const selectedInstitutionalPages = institutional.pages.filter((page) =>
    institutionalOverviewPages.has(page.pageNumber),
  );
  const cleanedInstitutional = cleanDocument(selectedInstitutionalPages, {
    sourceFile: institutionalFile,
    moduleNumber: null,
    moduleTitle: null,
  });
  const institutionalDocument: RagDocumentInput = {
    courseSlug: courseSeed.slug,
    courseTitle: courseSeed.title,
    moduleSlug: null,
    moduleNumber: null,
    moduleTitle: null,
    documentTitle: `${courseSeed.title} — presentación institucional`,
    sourceFile: institutionalFile,
    sourceKind: "program_overview",
    sourceSha256: institutional.sourceSha256,
    routePath: `/courses/${courseSeed.slug}`,
    blocks: cleanedInstitutional.blocks,
  };
  const institutionalChunks = buildRagChunks(institutionalDocument);
  allChunks.push(...institutionalChunks);
  documentReports.push({
    sourceFile: institutionalFile,
    sourceKind: "program_overview",
    moduleSlug: null,
    pagesRead: institutional.pageCount,
    pagesIncluded: selectedInstitutionalPages.length,
    wordsIncluded: institutionalChunks.reduce((sum, chunk) => sum + chunk.wordCount, 0),
    blocksIncluded: cleanedInstitutional.blocks.length,
    chunksCreated: institutionalChunks.length,
    exactDuplicatesRemoved: cleanedInstitutional.exactDuplicatesRemoved,
    nearDuplicatesRemoved: cleanedInstitutional.nearDuplicatesRemoved,
    warnings: cleanedInstitutional.warnings,
  });

  const deduplicated = removeDuplicateChunks(allChunks);
  const reindexedChunks = reindexChunksByDocument(deduplicated.chunks);
  const validation = validateRagCorpus(
    reindexedChunks,
    courseSeed.modules.map((courseModule) => ({
      slug: courseModule.slug,
      order: courseModule.order,
      title: courseModule.title,
      pdfFile: courseModule.pdfFile,
    })),
  );

  if (validation.errors.length > 0) {
    throw new Error(`Validación RAG fallida:\n- ${validation.errors.join("\n- ")}`);
  }

  const warnings = [
    ...documentReports.flatMap((report) => report.warnings.map((warning) => `${report.sourceFile}: ${warning}`)),
    ...validation.warnings,
  ];
  const chunksByModule = Object.fromEntries(
    courseSeed.modules.map((courseModule) => [
      courseModule.slug,
      reindexedChunks.filter((chunk) => chunk.moduleSlug === courseModule.slug).length,
    ]),
  );

  const corpus: RagCorpusFile = {
    corpusVersion: RAG_CORPUS_VERSION,
    chunkingVersion: RAG_CHUNKING_VERSION,
    summary: {
      documentsProcessed: documentReports.length,
      pagesRead: documentReports.reduce((sum, report) => sum + report.pagesRead, 0),
      pagesIncluded: documentReports.reduce((sum, report) => sum + report.pagesIncluded, 0),
      words: reindexedChunks.reduce((sum, chunk) => sum + chunk.wordCount, 0),
      chunks: reindexedChunks.length,
      chunkWords: calculateChunkWordDistribution(reindexedChunks),
      chunksByModule,
      programOverviewChunks: reindexedChunks.filter((chunk) => chunk.sourceKind === "program_overview").length,
      exactDuplicatesRemoved:
        documentReports.reduce((sum, report) => sum + report.exactDuplicatesRemoved, 0) + deduplicated.removed,
      nearDuplicatesRemoved: documentReports.reduce((sum, report) => sum + report.nearDuplicatesRemoved, 0),
      duplicateBookPagesExcluded: 81,
      nonCanonicalBookPagesExcluded: institutional.pageCount - 81 - selectedInstitutionalPages.length,
      warnings,
    },
    documents: documentReports,
    chunks: reindexedChunks,
  };

  const serialized = `${JSON.stringify(corpus, null, 2)}\n`;
  await fs.mkdir(outputDir, { recursive: true });

  if (checkOnly) {
    const current = await fs.readFile(outputFile, "utf8").catch(() => "");
    const normalizedCurrent = current.replace(/\r\n/g, "\n");
    if (normalizedCurrent !== serialized) {
      throw new Error(`El corpus está desactualizado. Ejecuta npm run content:prepare:rag.`);
    }
    console.log(`Corpus RAG validado: ${path.relative(projectRoot, outputFile)}`);
  } else {
    await fs.writeFile(outputFile, serialized, "utf8");
    console.log(`Corpus RAG generado: ${path.relative(projectRoot, outputFile)}`);
  }

  console.log(JSON.stringify(corpus.summary, null, 2));
}

function assertCourseMetadata() {
  if (courseSeed.modules.length !== 11) {
    throw new Error(`Se esperaban 11 módulos y course-seed.ts contiene ${courseSeed.modules.length}.`);
  }

  const files = new Set<string>();
  for (const courseModule of courseSeed.modules) {
    if (files.has(courseModule.pdfFile)) {
      throw new Error(`PDF modular repetido en course-seed.ts: ${courseModule.pdfFile}.`);
    }
    files.add(courseModule.pdfFile);
  }
}

async function extractPdf(sourceFile: string): Promise<ExtractedPdf> {
  const data = await fs.readFile(path.join(sourceDir, sourceFile));
  const pages: ExtractedPage[] = [];

  const parsed = await pdf(data, {
    async pagerender(pageData: PdfPageData) {
      const pageNumber = pages.length + 1;
      const page = await renderPage(pageData, pageNumber);
      pages.push(page);
      return page.lines.map((line) => line.text).join("\n");
    },
  });

  if (pages.length !== parsed.numpages) {
    throw new Error(`${sourceFile}: se extrajeron ${pages.length} de ${parsed.numpages} páginas.`);
  }

  return {
    pages,
    pageCount: parsed.numpages,
    sourceSha256: sha256(data),
  };
}

async function renderPage(pageData: PdfPageData, pageNumber: number): Promise<ExtractedPage> {
  const content = await pageData.getTextContent({
    normalizeWhitespace: false,
    disableCombineTextItems: false,
  });
  const items = content.items
    .filter((item) => item.str.trim())
    .map((item) => ({
      ...item,
      x: item.transform[4] ?? 0,
      y: item.transform[5] ?? 0,
      height: item.height ?? Math.abs(item.transform[3] ?? 0),
    }))
    .sort((left, right) => right.y - left.y || left.x - right.x);

  const grouped: Array<{ y: number; items: typeof items }> = [];
  for (const item of items) {
    const line = grouped.find((candidate) => Math.abs(candidate.y - item.y) <= 2.2);
    if (line) {
      line.items.push(item);
      line.y = (line.y + item.y) / 2;
    } else {
      grouped.push({ y: item.y, items: [item] });
    }
  }

  grouped.sort((left, right) => right.y - left.y);
  const lines = grouped.map((line, index) => {
    line.items.sort((left, right) => left.x - right.x);
    let text = "";
    let previousEnd: number | null = null;
    let hasLargeHorizontalGap = false;

    for (const item of line.items) {
      const gap = previousEnd === null ? 0 : item.x - previousEnd;
      if (gap > 18) hasLargeHorizontalGap = true;
      if (text && gap > 18) text += " | ";
      else if (text && gap > 1.5 && !text.endsWith(" ")) text += " ";
      text += item.str;
      previousEnd = item.x + (item.width ?? 0);
    }

    const previousLine = grouped[index - 1];
    return {
      pageNumber,
      text: normalizeWhitespace(text),
      y: line.y,
      height: Math.max(...line.items.map((item) => item.height || 0)),
      gapBefore: previousLine ? previousLine.y - line.y : 0,
      hasLargeHorizontalGap,
    };
  });

  return { pageNumber, lines };
}

function cleanDocument(
  pages: ExtractedPage[],
  context: { sourceFile: string; moduleNumber: number | null; moduleTitle: string | null },
) {
  const repeatedMargins = findRepeatedMarginLines(pages);
  const warnings: string[] = [];
  const rawBlocks: RagBlock[] = [];

  for (const page of pages) {
    const cleanedLines = removeRedundantLeadingHeader(page.lines
      .map((line) => ({ ...line, text: cleanLine(line.text, context) }))
      .filter((line) => line.text && !isNoiseLine(line.text, repeatedMargins)));

    if (cleanedLines.length === 0) {
      const originalWordCount = countWords(page.lines.map((line) => line.text).join(" "));
      if (originalWordCount > 80) {
        warnings.push(`La página ${page.pageNumber} quedó vacía después de la limpieza.`);
      }
      continue;
    }

    rawBlocks.push(...linesToBlocks(cleanedLines));
  }

  const deduplicated = deduplicateBlocks(rawBlocks);
  const headingCount = deduplicated.blocks.filter((block) =>
    block.kind === "heading" || block.kind === "subheading",
  ).length;
  if (headingCount < 2) warnings.push(`Solo se infirieron ${headingCount} encabezados.`);

  return {
    blocks: deduplicated.blocks,
    exactDuplicatesRemoved: deduplicated.exactDuplicatesRemoved,
    nearDuplicatesRemoved: deduplicated.nearDuplicatesRemoved,
    warnings,
  };
}

function removeRedundantLeadingHeader(lines: LayoutLine[]) {
  if (lines.length < 2) return lines;

  const leading = lines[0];
  const leadingNormalized = normalizeForComparison(leading.text);
  const leadingWords = countWords(leading.text);
  if (!leadingNormalized || leadingWords > 6) return lines;

  const repeatedByTitle = lines.slice(1, 4).some((candidate) => {
    const candidateNormalized = normalizeForComparison(candidate.text);
    const leadingTokens = leadingNormalized.split(" ").filter((token) => token.length > 2 && token !== "para");
    const candidateTokens = new Set(candidateNormalized.split(" "));
    const sharedTokenRatio = leadingTokens.length === 0
      ? 0
      : leadingTokens.filter((token) => candidateTokens.has(token)).length / leadingTokens.length;
    const titleContainsHeader = sharedTokenRatio >= 0.6;
    return candidateNormalized === leadingNormalized
      || (candidateNormalized.length > leadingNormalized.length
        && (candidateNormalized.startsWith(leadingNormalized)
          || candidateNormalized.includes(leadingNormalized)
          || titleContainsHeader));
  });

  return repeatedByTitle ? lines.slice(1) : lines;
}

function findRepeatedMarginLines(pages: ExtractedPage[]) {
  const counts = new Map<string, number>();
  for (const page of pages) {
    const marginLines = [...page.lines.slice(0, 3), ...page.lines.slice(-3)];
    const seenOnPage = new Set<string>();
    for (const line of marginLines) {
      const normalized = normalizeForComparison(line.text);
      if (!normalized || seenOnPage.has(normalized)) continue;
      seenOnPage.add(normalized);
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  }

  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count >= Math.min(3, Math.max(2, Math.ceil(pages.length / 3))))
      .map(([line]) => line),
  );
}

function cleanLine(
  value: string,
  context: { moduleNumber: number | null; moduleTitle: string | null },
) {
  let text = normalizeWhitespace(value);

  text = text.replace(
    /^Programa de Inteligencia Artificial Aplicada a la Educación con NotebookLM\s*/i,
    "",
  );
  text = text.replace(/^Programa de IA Educativa con NotebookLM\s*/i, "");
  text = text.replace(/^Cuadernillo institucional completo\s*/i, "");
  text = text.replace(/^[|·:\-–—]+\s*/, "");
  text = text.replace(/\s*[|·-]?\s*P[aá]gina\s+\d+\s*$/i, "");
  text = text.replace(/^P[aá]gina\s+\d+\s*$/i, "");

  if (context.moduleNumber !== null) {
    const moduleHeader = new RegExp(`^M[oó]dulo\\s+${context.moduleNumber}\\s*[|:-].*$`, "i");
    if (moduleHeader.test(text) && /p[aá]gina/i.test(value)) return "";
  }

  return normalizeWhitespace(text);
}

function isNoiseLine(text: string, repeatedMargins: Set<string>) {
  const normalized = normalizeForComparison(text);
  if (!normalized) return true;
  if (repeatedMargins.has(normalized)) return true;
  if (/^p[aá]gina\s+\d+$/i.test(text)) return true;
  if (/^-?\s*m[oó]dulo\s+\d+\s*$/i.test(text)) return true;
  if (/^material de (clase|capacitaci[oó]n)(\s*[-|·].*)?$/i.test(text)) return true;
  if (/^dirigido a nivel terciario/i.test(text)) return true;
  return false;
}

function linesToBlocks(lines: LayoutLine[]) {
  const medianHeight = median(lines.map((line) => line.height).filter((height) => height > 0)) || 10;
  const blocks: RagBlock[] = [];
  let paragraphLines: LayoutLine[] = [];
  let structuredLines: LayoutLine[] = [];
  let structuredKind: "list" | "table" | null = null;

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    blocks.push({
      pageNumber: paragraphLines[0].pageNumber,
      kind: "paragraph",
      text: joinWrappedLines(paragraphLines.map((line) => line.text)),
    });
    paragraphLines = [];
  };

  const flushStructured = () => {
    if (structuredLines.length === 0 || !structuredKind) return;
    blocks.push({
      pageNumber: structuredLines[0].pageNumber,
      kind: structuredKind,
      text: structuredLines.map((line) => line.text).join("\n"),
    });
    structuredLines = [];
    structuredKind = null;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const headingKind = inferHeadingKind(line, medianHeight);
    if (headingKind) {
      flushParagraph();
      flushStructured();
      const merged = mergeWrappedHeading(lines, index, headingKind, medianHeight);
      blocks.push({ pageNumber: line.pageNumber, kind: headingKind, text: merged.text });
      index = merged.lastIndex;
      continue;
    }

    const kind = inferStructuredKind(line);
    if (kind) {
      flushParagraph();
      if (structuredKind && structuredKind !== kind) flushStructured();
      structuredKind = kind;
      structuredLines.push(line);
      continue;
    }

    flushStructured();
    const previous = paragraphLines.at(-1);
    const startsNewParagraph = previous
      && line.gapBefore > Math.max(medianHeight * 1.45, 8)
      && /[.!?:]$/.test(previous.text);
    if (startsNewParagraph) flushParagraph();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushStructured();
  return blocks.filter((block) => countWords(block.text) > 0);
}

function inferHeadingKind(line: LayoutLine, medianHeight: number): "heading" | "subheading" | null {
  const text = line.text;
  const words = countWords(text);
  const isLarge = line.height >= medianHeight * 1.12;
  const decimalHeading = /^\d{1,2}\.\d+(?:\.\d+)?\.?\s+\D/u.test(text);
  const numberedHeading = /^\d{1,2}\.\s+\D/u.test(text);
  const namedSection = /^(presentaci[oó]n ejecutiva|fundamentaci[oó]n acad[eé]mica e institucional|prop[oó]sito, alcance y destinatarios|objetivos del programa|metodolog[ií]a did[aá]ctica|modalidad, duraci[oó]n y recursos|evaluaci[oó]n y proyecto final|resultados esperados e impacto institucional|perfil del capacitador y posicionamiento|fuentes de apoyo y apertura de los m[oó]dulos)$/i.test(text);
  const shortLabel = /^(objetivo did[aá]ctico|prop[oó]sito del m[oó]dulo|resultados de aprendizaje|idea central|consigna|actividad pr[aá]ctica|cierre conceptual|evaluaci[oó]n formativa|checklist docente|demostraci[oó]n en vivo)$/i.test(text);
  const uppercase = words >= 2 && words <= 12 && text === text.toLocaleUpperCase("es");

  if (decimalHeading && (isLarge || words <= 14)) return "subheading";
  if (numberedHeading && (isLarge || (words <= 12 && text.length <= 80))) return "heading";
  if (namedSection || (uppercase && isLarge)) return "heading";
  if (shortLabel && (isLarge || words <= 8)) return "subheading";
  if (
    isLarge
    && words >= 2
    && words <= 10
    && text.length <= 80
    && /^[A-ZÁÉÍÓÚÑ¿¡]/u.test(text)
    && !/[.,;:]$/.test(text)
  ) return "subheading";
  return null;
}

function mergeWrappedHeading(
  lines: LayoutLine[],
  index: number,
  kind: "heading" | "subheading",
  medianHeight: number,
) {
  const current = lines[index];
  const next = lines[index + 1];
  if (!next) return { text: current.text, lastIndex: index };

  const sameVisualLevel = Math.abs(next.height - current.height) <= Math.max(1, current.height * 0.12);
  const nextKind = inferHeadingKind(next, medianHeight);
  const likelyContinuation = sameVisualLevel
    && !/[.!?:]$/.test(current.text)
    && countWords(next.text) <= 10
    && !nextKind
    && !inferStructuredKind(next);

  return likelyContinuation
    ? { text: `${current.text} ${next.text}`, lastIndex: index + 1, kind }
    : { text: current.text, lastIndex: index, kind };
}

function inferStructuredKind(line: LayoutLine): "list" | "table" | null {
  if (/^(?:[•●▪◦□✓✔-]|\d+[.)])\s*/u.test(line.text)) return "list";
  if (line.hasLargeHorizontalGap && countWords(line.text) >= 3) return "table";
  return null;
}

function joinWrappedLines(lines: string[]) {
  let result = "";
  for (const line of lines) {
    if (!result) {
      result = line;
      continue;
    }
    if (/\p{L}-$/u.test(result) && /^\p{Ll}/u.test(line)) {
      result = `${result.slice(0, -1)}${line}`;
    } else {
      result = `${result} ${line}`;
    }
  }
  return normalizeWhitespace(result);
}

function deduplicateBlocks(blocks: RagBlock[]) {
  const accepted: RagBlock[] = [];
  const exact = new Set<string>();
  const structuredLines = new Set<string>();
  let exactDuplicatesRemoved = 0;
  let nearDuplicatesRemoved = 0;

  for (const originalBlock of blocks) {
    const block = originalBlock.kind === "table"
      ? removeRepeatedStructuredLines(originalBlock, structuredLines, () => {
        exactDuplicatesRemoved += 1;
      })
      : originalBlock;
    const normalized = normalizeForComparison(block.text);
    if (!normalized) continue;
    const hash = sha256(normalized);
    if (exact.has(hash) && countWords(block.text) >= 5) {
      exactDuplicatesRemoved += 1;
      continue;
    }

    const nearDuplicate = countWords(block.text) >= 45 && accepted.some((candidate) =>
      candidate.kind === block.kind
      && countWords(candidate.text) >= 45
      && nearDuplicateScore(candidate.text, block.text) >= 0.96,
    );
    if (nearDuplicate) {
      nearDuplicatesRemoved += 1;
      continue;
    }

    exact.add(hash);
    accepted.push(block);
  }

  return { blocks: accepted, exactDuplicatesRemoved, nearDuplicatesRemoved };
}

function removeRepeatedStructuredLines(
  block: RagBlock,
  seen: Set<string>,
  onDuplicate: () => void,
) {
  const lines = block.text.split("\n").filter((line) => {
    const normalized = normalizeForComparison(line);
    if (!normalized || !line.includes("|")) return true;
    if (seen.has(normalized)) {
      onDuplicate();
      return false;
    }
    seen.add(normalized);
    return true;
  });

  return { ...block, text: lines.join("\n") };
}

function nearDuplicateScore(left: string, right: string) {
  const leftWords = normalizeForComparison(left).split(" ");
  const rightWords = normalizeForComparison(right).split(" ");
  const ratio = Math.min(leftWords.length, rightWords.length) / Math.max(leftWords.length, rightWords.length);
  if (ratio < 0.88) return 0;

  const leftShingles = createShingles(leftWords, 5);
  const rightShingles = createShingles(rightWords, 5);
  if (leftShingles.size === 0 || rightShingles.size === 0) return 0;
  let intersection = 0;
  for (const shingle of leftShingles) if (rightShingles.has(shingle)) intersection += 1;
  return intersection / Math.min(leftShingles.size, rightShingles.size);
}

function createShingles(words: string[], size: number) {
  const shingles = new Set<string>();
  for (let index = 0; index <= words.length - size; index += 1) {
    shingles.add(words.slice(index, index + size).join(" "));
  }
  return shingles;
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function reindexChunksByDocument(chunks: ReturnType<typeof buildRagChunks>) {
  const counters = new Map<string, number>();
  return chunks.map((chunk) => {
    const nextIndex = counters.get(chunk.sourceFile) ?? 0;
    counters.set(chunk.sourceFile, nextIndex + 1);
    return { ...chunk, chunkIndex: nextIndex };
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
