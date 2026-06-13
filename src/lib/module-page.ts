import type { CourseModule } from "@/lib/course";

type ExamAttemptSummary = {
  correct: number;
  total: number;
  percent: number;
  passed: number;
};

export function getModulePdfUrl(pdfFile: string) {
  return `/course-assets/pdfs/${encodeURIComponent(pdfFile)}`;
}

export function buildModuleExamSummary(
  courseModule: CourseModule,
  latestAttempt?: ExamAttemptSummary,
) {
  const status = !latestAttempt ? "not_started" : latestAttempt.passed ? "passed" : "retry";

  return {
    totalQuestions: courseModule.examQuestions.length,
    passingPercent: 80,
    status,
    actionLabel:
      status === "passed"
        ? "Ver o repetir examen"
        : status === "retry"
          ? "Volver a intentar"
          : "Comenzar examen",
    latestAttempt,
  } as const;
}
