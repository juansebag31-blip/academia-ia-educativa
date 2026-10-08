import { describe, expect, it } from "vitest";
import { RAG_TUTOR_SYSTEM_INSTRUCTION } from "./answer-prompt";
import { selectRagContext } from "./context-selection";
import { RAG_GENERATION_EVALUATION_CASES } from "./generation-evaluation-cases";
import type { RagGenerationProvider } from "./generation-provider";
import { generateGroundedRagAnswer } from "./grounded-answer";
import type { RagSearchResult } from "./retrieval";

function searchResult(overrides: Partial<RagSearchResult> = {}): RagSearchResult {
  return {
    chunkId: "chunk-1",
    documentId: "document-1",
    content: "La calidad de las fuentes permite fundamentar la respuesta educativa.",
    courseSlug: "ia-educativa-notebooklm",
    courseTitle: "Academia IA Educativa",
    moduleSlug: "modulo-6-notebooklm-desde-cero",
    moduleNumber: 6,
    moduleTitle: "NotebookLM desde cero",
    sectionPath: ["Fuentes"],
    sectionTitle: "Fuentes: el corazón de NotebookLM",
    subsectionTitle: null,
    documentTitle: "Módulo 6",
    sourceFile: "modulo-6.pdf",
    sourceKind: "module_pdf",
    sourceSha256: "a".repeat(64),
    pageStart: 4,
    pageEnd: 4,
    chunkIndex: 3,
    wordCount: 10,
    contentSha256: "b".repeat(64),
    routePath: "/courses/ia-educativa-notebooklm/modules/6",
    similarity: 0.81,
    ...overrides,
  };
}

function generationProvider(answer: string, onCall?: () => void): RagGenerationProvider {
  return {
    model: "test-model",
    async generateAnswer() {
      onCall?.();
      return answer;
    },
  };
}

describe("grounded RAG answer generation", () => {
  it("requires citations in every substantive paragraph or list item", () => {
    expect(RAG_TUTOR_SYSTEM_INSTRUCTION).toContain(
      "Todo párrafo o elemento de lista que contenga una afirmación sustantiva debe incluir al menos una cita válida [S#]. No agrupes varias afirmaciones factuales en bloques sin indicar sus fuentes.",
    );
    expect(RAG_TUTOR_SYSTEM_INSTRUCTION).toContain(
      "Cualquier inferencia debe presentarse claramente como una explicación derivada de las fuentes",
    );
    expect(RAG_TUTOR_SYSTEM_INSTRUCTION).toContain(
      "Si una afirmación no puede sustentarse en ningún fragmento, omítela.",
    );
    expect(RAG_TUTOR_SYSTEM_INSTRUCTION).toContain(
      "No uses identificadores que no aparezcan en el contexto.",
    );
  });

  it("rejects insufficient evidence without calling the generator", async () => {
    let calls = 0;
    const response = await generateGroundedRagAnswer({
      question: "¿Cuál es el precio del dólar?",
      retrievalResults: [searchResult({ similarity: 0.699 })],
      generationProvider: generationProvider("No debe ejecutarse.", () => { calls += 1; }),
      threshold: 0.7,
    });

    expect(response).toEqual({
      status: "insufficient_evidence",
      answer: null,
      sources: [],
    });
    expect(calls).toBe(0);
  });

  it("selects at most five relevant, non-duplicate chunks from multiple modules", () => {
    const contents = [
      "Internet conecta dispositivos y permite acceder a servicios educativos remotos.",
      "Los conjuntos de datos aportan ejemplos para entrenar sistemas predictivos.",
      "Los servidores ejecutan cálculos intensivos mediante procesadores especializados.",
      "La nube ofrece infraestructura escalable para instituciones con distintas necesidades.",
      "La privacidad exige revisar qué información se comparte con cada plataforma.",
      "El pensamiento crítico ayuda a verificar resultados antes de utilizarlos en clase.",
      "Las fuentes académicas permiten contrastar explicaciones y reconocer sus límites.",
    ];
    const results = Array.from({ length: 7 }, (_, index) => searchResult({
      chunkId: `chunk-${index}`,
      moduleNumber: index % 2 === 0 ? 1 : 3,
      moduleSlug: index % 2 === 0
        ? "modulo-1-introduccion-historica-ia"
        : "modulo-3-infraestructura-datos-computacion",
      content: contents[index],
      contentSha256: String(index).repeat(64),
      similarity: 0.82 - index * 0.01,
    }));
    results[1] = {
      ...results[1],
      content: results[0].content,
      contentSha256: results[0].contentSha256,
    };

    const selected = selectRagContext(results);

    expect(selected).toHaveLength(5);
    expect(selected.map(({ result }) => result.chunkId)).not.toContain("chunk-1");
    expect(new Set(selected.map(({ result }) => result.moduleNumber))).toEqual(new Set([1, 3]));
  });

  it("returns structured sources and valid citations", async () => {
    let prompt = "";
    const provider: RagGenerationProvider = {
      model: "test-model",
      async generateAnswer(request) {
        prompt = request.userPrompt;
        return "Las fuentes propias permiten fundamentar la explicación [S1].";
      },
    };
    const response = await generateGroundedRagAnswer({
      question: "¿Por qué importan las fuentes?",
      retrievalResults: [searchResult()],
      generationProvider: provider,
      threshold: 0.7,
    });

    expect(response.status).toBe("answered");
    expect(response.answer).toContain("[S1]");
    expect(response.sources).toEqual([expect.objectContaining({
      id: "S1",
      moduleNumber: 6,
      pageStart: 4,
      pageEnd: 4,
      similarity: 0.81,
    })]);
    expect(prompt).toContain("[S1] Módulo 6");
    expect(prompt).not.toContain("0.81");
  });

  it("rejects citations that do not map to a selected source", async () => {
    await expect(generateGroundedRagAnswer({
      question: "¿Por qué importan las fuentes?",
      retrievalResults: [searchResult()],
      generationProvider: generationProvider("La explicación figura en el curso [S9]."),
      threshold: 0.7,
    })).rejects.toThrow("citas inexistentes: S9");
  });

  it("covers every module, relational questions and five out-of-corpus cases", () => {
    const moduleCases = RAG_GENERATION_EVALUATION_CASES.filter(({ group }) => group === "module");
    const relationalCases = RAG_GENERATION_EVALUATION_CASES.filter(({ group }) => group === "relational");
    const externalCases = RAG_GENERATION_EVALUATION_CASES.filter(({ group }) =>
      group === "out_of_corpus");

    expect(new Set(moduleCases.flatMap(({ expectedTargets }) =>
      expectedTargets.map(({ moduleSlug }) => moduleSlug))).size).toBe(11);
    expect(relationalCases).toHaveLength(3);
    expect(externalCases).toHaveLength(5);
    expect(externalCases.every(({ answerable }) => !answerable)).toBe(true);
  });
});
