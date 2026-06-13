export type LearningSectionKey =
  | "guidedPath"
  | "studentNotebook"
  | "promptTemplates"
  | "simulator"
  | "lab"
  | "practiceQuiz"
  | "flashcards"
  | "masteryChecklist"
  | "rubric";

export type LearningSection = {
  key: LearningSectionKey;
  step: number;
  title: string;
  subtitle: string;
};

export const learningSections: LearningSection[] = [
  {
    key: "guidedPath",
    step: 1,
    title: "Ruta progresiva del módulo",
    subtitle: "Empieza por la orientación general y avanza de menos a más.",
  },
  {
    key: "studentNotebook",
    step: 2,
    title: "Cuaderno del estudiante",
    subtitle: "Escribe evidencia de comprensión mientras avanzas.",
  },
  {
    key: "promptTemplates",
    step: 3,
    title: "Plantillas de prompts",
    subtitle: "Copia, adapta y usa instrucciones con tus fuentes.",
  },
  {
    key: "simulator",
    step: 4,
    title: "Simulador NotebookLM",
    subtitle: "Practica un flujo real de trabajo con fuentes propias.",
  },
  {
    key: "lab",
    step: 5,
    title: "Laboratorio práctico",
    subtitle: "Produce una evidencia concreta del aprendizaje.",
  },
  {
    key: "practiceQuiz",
    step: 6,
    title: "Mini quiz de práctica",
    subtitle: "Comprueba comprensión antes del examen certificante.",
  },
  {
    key: "flashcards",
    step: 7,
    title: "Flashcards internas",
    subtitle: "Repasa conceptos clave con preguntas rápidas.",
  },
  {
    key: "masteryChecklist",
    step: 8,
    title: "Checklist de dominio",
    subtitle: "Marca lo que ya puedes explicar o aplicar.",
  },
  {
    key: "rubric",
    step: 9,
    title: "Rúbrica del producto",
    subtitle: "Evalúa si tu evidencia está lograda antes de cerrar el módulo.",
  },
];

export function getLearningSection(key: LearningSectionKey) {
  return learningSections.find((section) => section.key === key);
}
