import type { CourseModule } from "./course";

export type ProgramInfographicStage = {
  title: string;
  description: string;
  modules: number[];
};

export type ModuleInfographic = {
  problem: string;
  keyIdeas: string[];
  workflow: Array<{
    label: string;
    detail: string;
  }>;
  finalEvidence: string;
  examTarget: string;
};

export const programInfographicStages: ProgramInfographicStage[] = [
  {
    title: "Base conceptual",
    description: "Comprender qué es la IA, cómo se volvió masiva y qué criterios éticos exige.",
    modules: [1, 2, 3, 4],
  },
  {
    title: "Herramientas y criterio",
    description: "Elegir herramientas de IA según tarea, riesgo, fuente y evidencia necesaria.",
    modules: [5],
  },
  {
    title: "NotebookLM aplicado",
    description: "Usar fuentes propias para estudiar, enseñar y producir materiales verificables.",
    modules: [6, 7, 8],
  },
  {
    title: "Investigación y proyecto",
    description: "Construir síntesis académica, proyecto final y una rutina de actualización permanente.",
    modules: [9, 10, 11],
  },
];

export function buildModuleInfographic(courseModule: CourseModule): ModuleInfographic {
  return {
    problem: courseModule.purpose,
    keyIdeas: courseModule.lessons.map((lesson) => `${lesson.title}: ${lesson.summary}`),
    workflow: [
      {
        label: "Fuente",
        detail: "Trabaja con el PDF del módulo y materiales propios relacionados.",
      },
      {
        label: "Pregunta",
        detail: "Formula dudas concretas antes de pedir ayuda a una herramienta de IA.",
      },
      {
        label: "Contrasta",
        detail: "Compara respuestas con las fuentes y separa evidencia de interpretación.",
      },
      {
        label: "Produce",
        detail: `Construye el producto esperado: ${courseModule.product}`,
      },
      {
        label: "Valida",
        detail: "Repasa con checklist, rúbrica y examen certificante del 80%.",
      },
    ],
    finalEvidence: courseModule.product,
    examTarget: "Examen del módulo: aprobar con 80% o más para validar dominio.",
  };
}
