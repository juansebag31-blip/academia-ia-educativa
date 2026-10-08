import { describe, expect, it } from "vitest";
import {
  buildRagChunks,
  calculateChunkWordDistribution,
  normalizeForComparison,
  removeDuplicateChunks,
  validateRagCorpus,
  type RagDocumentInput,
} from "./corpus";

const baseDocument: RagDocumentInput = {
  courseSlug: "ia-educativa-notebooklm",
  courseTitle: "Programa de Inteligencia Artificial Aplicada a la Educación con NotebookLM",
  moduleSlug: "modulo-1-introduccion-historica-ia",
  moduleNumber: 1,
  moduleTitle: "Módulo 1 - Introducción histórica a la Inteligencia Artificial",
  documentTitle: "Módulo 1 - Introducción histórica a la Inteligencia Artificial",
  sourceFile: "Modulo_1_IA_Educativa_NotebookLM.pdf",
  sourceKind: "module_pdf",
  sourceSha256: "source-hash",
  routePath: "/courses/ia-educativa-notebooklm/modules/modulo-1-introduccion-historica-ia",
  blocks: [],
};

describe("RAG corpus preparation", () => {
  it("normalizes accents, punctuation and whitespace for duplicate detection", () => {
    expect(normalizeForComparison("  Educación,  ética e IA. ")).toBe("educacion etica e ia");
  });

  it("keeps semantic sections separate even when they are short", () => {
    const chunks = buildRagChunks({
      ...baseDocument,
      blocks: [
        { pageNumber: 1, kind: "heading", text: "1. Primera sección" },
        { pageNumber: 1, kind: "paragraph", text: "Contenido breve y completo de la primera sección." },
        { pageNumber: 2, kind: "heading", text: "2. Segunda sección" },
        { pageNumber: 2, kind: "paragraph", text: "Contenido breve y completo de la segunda sección." },
      ],
    });

    expect(chunks).toHaveLength(2);
    expect(chunks[0].sectionTitle).toBe("1. Primera sección");
    expect(chunks[1].sectionTitle).toBe("2. Segunda sección");
    expect(chunks[0].pageEnd).toBe(1);
    expect(chunks[1].pageStart).toBe(2);
  });

  it("only overlaps when an oversized section is split", () => {
    const paragraph = (label: string) => `${label} ${"contenido educativo verificable ".repeat(140)}`;
    const chunks = buildRagChunks({
      ...baseDocument,
      blocks: [
        { pageNumber: 1, kind: "heading", text: "1. Sección extensa" },
        { pageNumber: 1, kind: "paragraph", text: paragraph("Primer bloque.") },
        { pageNumber: 2, kind: "paragraph", text: paragraph("Segundo bloque.") },
        { pageNumber: 3, kind: "paragraph", text: paragraph("Tercer bloque.") },
      ],
    });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.sectionTitle === "1. Sección extensa")).toBe(true);
    expect(chunks[1].content).toContain("contenido educativo verificable");
  });

  it("removes exact chunk duplicates and reports stable word statistics", () => {
    const chunks = buildRagChunks({
      ...baseDocument,
      blocks: [
        { pageNumber: 1, kind: "heading", text: "1. Contenido" },
        { pageNumber: 1, kind: "paragraph", text: "Una explicación educativa completa." },
      ],
    });
    const duplicate = { ...chunks[0], chunkIndex: 1 };
    const result = removeDuplicateChunks([chunks[0], duplicate]);

    expect(result.removed).toBe(1);
    expect(result.chunks).toHaveLength(1);
    expect(calculateChunkWordDistribution(result.chunks).minimum).toBeGreaterThan(0);
  });

  it("validates module-to-PDF mapping and rejects crossed metadata", () => {
    const chunks = buildRagChunks({
      ...baseDocument,
      blocks: [{ pageNumber: 1, kind: "paragraph", text: "Contenido verificable." }],
    });
    const expected = [{
      slug: baseDocument.moduleSlug!,
      order: 1,
      title: baseDocument.moduleTitle!,
      pdfFile: baseDocument.sourceFile,
    }];

    expect(validateRagCorpus(chunks, expected).errors).toEqual([]);
    expect(validateRagCorpus([{ ...chunks[0], sourceFile: "otro.pdf" }], expected).errors)
      .toContain("Metadata cruzada en otro.pdf#0.");
  });
});
