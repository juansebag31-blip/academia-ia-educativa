import type { RagChunk, RagCorpusFile } from "./corpus";

export const RAG_SMOKE_CASES = [
  {
    moduleSlug: "modulo-2-ia-generativa-lenguaje-simple",
    sectionNeedle: "alucinaciones",
    query: "¿Por qué una inteligencia artificial puede inventar información?",
  },
  {
    moduleSlug: "modulo-6-notebooklm-desde-cero",
    sectionNeedle: "qué es notebooklm",
    query: "¿Qué es NotebookLM y para qué sirve en educación?",
  },
  {
    moduleSlug: "modulo-11-actualizacion-permanente",
    sectionNeedle: "rutina concreta para mantenerse actualizado",
    query: "¿Cómo puedo mantenerme actualizado con los cambios de inteligencia artificial?",
  },
] as const;

export function selectRagSmokeChunks(corpus: RagCorpusFile) {
  return RAG_SMOKE_CASES.map((testCase) => {
    const needle = testCase.sectionNeedle.toLocaleLowerCase("es");
    const chunk = corpus.chunks.find((candidate) =>
      candidate.moduleSlug === testCase.moduleSlug
      && [candidate.sectionTitle, candidate.subsectionTitle]
        .filter(Boolean)
        .some((title) => title!.toLocaleLowerCase("es").includes(needle)),
    );
    if (!chunk) throw new Error(`No se encontró el chunk de prueba para ${testCase.moduleSlug}.`);
    return { testCase, chunk } satisfies { testCase: typeof testCase; chunk: RagChunk };
  });
}
