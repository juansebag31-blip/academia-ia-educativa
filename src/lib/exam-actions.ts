"use server";

import { revalidatePath } from "next/cache";
import { courseSeed } from "./course-seed";
import { findModuleBySlug } from "./course";
import { gradeExam } from "./exam";
import { initialExamState, type ExamActionState } from "./exam-state";

export async function submitModuleExam(_state: ExamActionState, formData: FormData): Promise<ExamActionState> {
  const moduleSlug = String(formData.get("moduleSlug") ?? "");
  const courseModule = findModuleBySlug(courseSeed, moduleSlug);

  if (!courseModule) {
    return {
      ...initialExamState,
      submitted: true,
      message: "No se encontró el módulo del examen.",
    };
  }

  const answers = Object.fromEntries(
    courseModule.examQuestions.map((question) => [question.id, String(formData.get(question.id) ?? "")]),
  );
  const result = gradeExam(courseModule.examQuestions, answers);

  revalidatePath(`/courses/${courseSeed.slug}/modules/${moduleSlug}`);
  revalidatePath(`/courses/${courseSeed.slug}/modules/${moduleSlug}/exam`);

  return {
    submitted: true,
    ...result,
    answers,
    message: result.passed
      ? "Aprobaste el examen. Ya puedes considerar certificado este módulo."
      : "Todavía no alcanzaste el 80%. Revisa el módulo y vuelve a intentarlo.",
  };
}
