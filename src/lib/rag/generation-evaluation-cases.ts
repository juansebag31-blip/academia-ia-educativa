import {
  RAG_RETRIEVAL_EVALUATION_CASES,
  type RagEvaluationCase,
} from "./evaluation-cases";

export type RagGenerationEvaluationGroup =
  | "module"
  | "program_overview"
  | "relational"
  | "out_of_corpus";

export type RagGenerationEvaluationCase = RagEvaluationCase & {
  group: RagGenerationEvaluationGroup;
};

const selectedCases: Array<{ id: string; group: RagGenerationEvaluationGroup }> = [
  { id: "m01-fluidez-verdad", group: "module" },
  { id: "m02-alucinaciones", group: "module" },
  { id: "m03-procesamiento", group: "module" },
  { id: "m04-privacidad", group: "module" },
  { id: "m05-elegir-herramienta", group: "module" },
  { id: "m06-fuentes-corazon", group: "module" },
  { id: "m07-examenes", group: "module" },
  { id: "m08-inclusion", group: "module" },
  { id: "m09-honestidad", group: "module" },
  { id: "m10-rubrica", group: "module" },
  { id: "m11-rutina", group: "module" },
  { id: "overview-metodologia", group: "program_overview" },
  { id: "rel-fuentes-verificacion", group: "relational" },
  { id: "rel-estudiante-responsable", group: "relational" },
  { id: "rel-docente-fuentes", group: "relational" },
  { id: "out-precio-dolar", group: "out_of_corpus" },
  { id: "out-personal", group: "out_of_corpus" },
  { id: "out-kubernetes", group: "out_of_corpus" },
  { id: "out-clima", group: "out_of_corpus" },
  { id: "out-medico", group: "out_of_corpus" },
];

const retrievalCasesById = new Map(
  RAG_RETRIEVAL_EVALUATION_CASES.map((testCase) => [testCase.id, testCase]),
);

export const RAG_GENERATION_EVALUATION_CASES: RagGenerationEvaluationCase[] = selectedCases
  .map(({ id, group }) => {
    const testCase = retrievalCasesById.get(id);
    if (!testCase) throw new Error(`No existe el caso de evaluación RAG ${id}.`);
    return { ...testCase, group };
  });
