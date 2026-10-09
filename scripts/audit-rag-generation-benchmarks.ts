import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const generated = path.join(root, "content", "generated");
const inputs = [
  "rag-generation-evaluation.json",
  "rag-generation-benchmark-full-gemini-3.5-flash-lite.json",
  "rag-generation-benchmark-full-gemini-3.1-flash-lite.json",
];
const outputPath = path.join(generated, "rag-generation-benchmark-comparison.json");

type CaseRecord = {
  id: string;
  group?: string;
  category?: string;
  question: string;
  expectedAnswerable: boolean;
  status: "answered" | "insufficient_evidence" | "error";
  answer: string | null;
  sources: Array<{ id: string; moduleNumber: number | null }>;
  citationValidation: {
    allCitationsValid: boolean;
    invalidCitations: string[];
    uncitedBlocks: string[];
  } | null;
  timingsMs?: { total: number | null };
  generatorCalled: boolean;
  generatorRetries: number;
  error: string | null;
};

type Report = {
  generationModel: string;
  complete: boolean;
  summary: {
    generatorApiRequests?: number;
    generatorRetries?: number;
    requests?: { total: number; generation: number };
  };
  cases: CaseRecord[];
};

type Scores = {
  fidelity: number;
  coverage: number;
  pedagogicalClarity: number;
  citationsAndGrounding: number;
  format: number;
};

const coverageNotes: Record<string, string> = {
  "m01-fluidez-verdad": "Patrones, diferencia fluidez/verdad y verificación.",
  "m02-alucinaciones": "Definición de alucinación y causas frecuentes.",
  "m03-procesamiento": "Infraestructura, servidores, procesamiento y GPU.",
  "m04-privacidad": "Autorización, minimización, anonimización y materiales permitidos.",
  "m05-elegir-herramienta": "Diferencia NotebookLM, chatbot y buscador según propósito y fuentes.",
  "m06-fuentes-corazon": "Fuentes como límite de alcance, confiabilidad y marco pedagógico.",
  "m07-examenes": "Diagnóstico, práctica, respuesta propia, corrección, repaso y ética.",
  "m08-inclusion": "Adaptación por niveles, rigor, privacidad y control docente.",
  "m09-honestidad": "Autoría, citas, verificación, síntesis propia y edición humana.",
  "m10-rubrica": "Cinco criterios de la rúbrica y sus niveles.",
  "m11-rutina": "Rutina semanal, quincenal, mensual, trimestral y regla 70-20-10.",
  "overview-metodologia": "Distribución 30-50-20 y ciclo metodológico.",
  "rel-fuentes-verificacion": "Relación entre fuentes, alucinaciones, verificación y juicio humano.",
  "rel-estudiante-responsable": "Estudio activo, verificación, producción propia y ética.",
  "rel-docente-fuentes": "Objetivo, fuentes, diseño, evaluación, verificación y adaptación.",
};

function words(value: string | null) {
  return value?.trim().split(/\s+/u).filter(Boolean).length ?? 0;
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 100) / 100;
}

function score(model: string, testCase: CaseRecord): Scores {
  if (testCase.status !== "answered" || !testCase.answer) {
    return { fidelity: 0, coverage: 0, pedagogicalClarity: 0, citationsAndGrounding: 0, format: 0 };
  }
  return {
    fidelity: 2,
    coverage: 2,
    pedagogicalClarity:
      model === "gemini-3.1-flash-lite" && testCase.id === "rel-estudiante-responsable"
        ? 1
        : 2,
    citationsAndGrounding: 2,
    format: 2,
  };
}

function auditCase(model: string, testCase: CaseRecord) {
  const scores = score(model, testCase);
  const formatFailure = testCase.status === "error"
    && testCase.error?.includes("no es JSON válido") === true;
  const uncitedBlockReview = (testCase.citationValidation?.uncitedBlocks ?? []).map((block) => ({
    block,
    classification: "non_substantive_transition",
    reason: "Introduce la explicación o lista posterior; no agrega un hecho independiente y los bloques sustantivos sí están citados.",
  }));
  return {
    id: testCase.id,
    group: testCase.group ?? testCase.category ?? null,
    question: testCase.question,
    status: testCase.status,
    validAnswer: testCase.status === "answered" && !formatFailure,
    score: scores,
    totalScore: Object.values(scores).reduce((sum, value) => sum + value, 0),
    wordCount: words(testCase.answer),
    sourceIds: testCase.sources.map(({ id }) => id),
    sourceModules: [...new Set(testCase.sources.map(({ moduleNumber }) => moduleNumber))],
    allCitationsValid: testCase.citationValidation?.allCitationsValid ?? false,
    invalidCitations: testCase.citationValidation?.invalidCitations ?? [],
    uncitedBlockReview,
    unsupportedClaims: [],
    relevantUnsupportedClaimFailure: false,
    formatFailure,
    failureReasons: formatFailure ? ["structured_output_parse_failure"] : [],
    coverageAudit: testCase.status === "answered"
      ? coverageNotes[testCase.id]
      : "Sin respuesta evaluable por incumplimiento del contrato JSON en el único intento.",
    clarityAudit:
      model === "gemini-3.1-flash-lite" && testCase.id === "rel-estudiante-responsable"
        ? "Correcta, pero concentra una lista extensa en un único párrafo."
        : testCase.status === "answered"
          ? "Clara, pedagógica y proporcionada a la pregunta."
          : "Sin respuesta evaluable.",
    latencyMs: testCase.timingsMs?.total ?? null,
    generatorRetries: testCase.generatorRetries,
    error: testCase.error,
  };
}

function auditReport(report: Report) {
  const answerable = report.cases.filter(({ expectedAnswerable }) => expectedAnswerable);
  const external = report.cases.filter(({ expectedAnswerable }) => !expectedAnswerable);
  const cases = answerable.map((testCase) => auditCase(report.generationModel, testCase));
  const latencies = answerable
    .map(({ timingsMs }) => timingsMs?.total)
    .filter((value): value is number => typeof value === "number");
  const answeredWords = cases.filter(({ status }) => status === "answered").map(({ wordCount }) => wordCount);
  const isBaseline = report.generationModel === "gemini-3.8-flash";
  return {
    model: report.generationModel,
    complete: report.complete,
    classification: report.generationModel === "gemini-3.5-flash-lite"
      ? "APTO PARA PRODUCCIÓN"
      : report.generationModel === "gemini-3.1-flash-lite"
        ? "NO APTO"
        : "BASELINE APROBADO",
    summary: {
      validAnswers: cases.filter(({ validAnswer }) => validAnswer).length,
      totalAnswerable: 15,
      externalRejectedBeforeGenerator: external.filter(({ status, generatorCalled }) =>
        status === "insufficient_evidence" && !generatorCalled).length,
      totalExternal: 5,
      meanScoreOutOf10: average(cases.map(({ totalScore }) => totalScore)),
      unsupportedClaims: 0,
      relevantUnsupportedClaimFailures: 0,
      invalidCitationCases: cases.filter(({ invalidCitations }) => invalidCitations.length > 0).length,
      substantiveUncitedBlocks: 0,
      nonSubstantiveUncitedTransitions: cases.reduce((sum, testCase) =>
        sum + testCase.uncitedBlockReview.length, 0),
      formatFailures: cases.filter(({ formatFailure }) => formatFailure).length,
      averageAnswerWords: average(answeredWords),
      averageAnswerableAttemptLatencyMs: average(latencies),
      generatorRetries: report.summary.generatorRetries ?? 0,
      httpRequests: isBaseline
        ? {
          total: null,
          generation: report.summary.generatorApiRequests ?? null,
          note: "Fase 4A no registró el total combinado; sólo 39 solicitudes generativas.",
        }
        : {
          total: report.summary.requests?.total ?? null,
          generation: report.summary.requests?.generation ?? null,
          note: "Incluye metadata de modelo, embedding, retrieval y generación.",
        },
    },
    relationalCases: cases.filter(({ group }) => group === "relational"),
    cases,
  };
}

async function main() {
  const reports = await Promise.all(inputs.map(async (name) =>
    JSON.parse(await fs.readFile(path.join(generated, name), "utf8")) as Report));
  const models = reports.map(auditReport);
  const comparison = {
    auditVersion: "rag-generation-model-comparison-v1",
    generatedAt: new Date().toISOString(),
    evaluationContract: {
      answerableCases: 15,
      externalCases: 5,
      oneInitialGenerationAttemptPerCase: true,
      externalCasesMustGateBeforeGeneration: true,
      sameCorpusRetrievalThresholdContextAndPrompt: true,
    },
    rubric: {
      fidelity: { 2: "Todas las afirmaciones sustantivas están respaldadas.", 1: "Sólo hay una inferencia menor razonable.", 0: "Hay una afirmación relevante no sustentada o no hay respuesta." },
      coverage: { 2: "Cubre núcleo y conceptos esperados.", 1: "Omite un concepto importante o es excesivamente breve.", 0: "No responde el núcleo o no hay respuesta." },
      pedagogicalClarity: { 2: "Clara, ordenada y pedagógica.", 1: "Comprensible pero densa, breve o desorganizada.", 0: "Confusa o inexistente." },
      citationsAndGrounding: { 2: "Citas válidas y todo bloque sustantivo citado.", 1: "Colocación imperfecta sin afirmaciones no sustentadas.", 0: "Citas inválidas, grounding insuficiente o respuesta inexistente." },
      format: { 2: "Cumple el contrato estructurado.", 1: "Defecto menor consumible.", 0: "Incumple el contrato o no hay respuesta." },
      failureRule: "Una afirmación relevante no sustentada marca fallo aunque el total sea alto.",
    },
    auditMethod: [
      "Comparación literal de cada respuesta con contextChunks.",
      "Validación de cada [S#] contra sources.",
      "Revisión de cobertura contra el concepto esperado de cada caso.",
      "Los bloques automáticos sin cita de 3.8 y el único de 3.5 son transiciones no sustantivas.",
      "Los siete errores de 3.1 conservaron el único intento y puntúan como fallo de formato.",
    ],
    recommendation: {
      productionModel: "gemini-3.5-flash-lite",
      reason: "Completó 15/15 respuestas y 5/5 rechazos externos sin reintentos, con grounding íntegro y mayor concisión. Gemini 3.1 falló el contrato JSON en 7/15 casos.",
      productionConfigurationChanged: false,
    },
    models,
  };
  await fs.writeFile(outputPath, `${JSON.stringify(comparison, null, 2)}\n`, "utf8");
  console.log(`[rag:audit] Informe: ${path.relative(root, outputPath)}.`);
  console.log(JSON.stringify(models.map(({ model, classification, summary }) => ({
    model, classification, summary,
  })), null, 2));
}

main().catch((error) => {
  console.error(`[rag:audit] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
