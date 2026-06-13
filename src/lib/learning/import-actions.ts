"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateImportPayload } from "./import-payload";

export type ImportActionState = {
  success: boolean;
  message: string;
  imported: { lessons: number; modules: number; exams: number };
};

export const initialImportState: ImportActionState = {
  success: false,
  message: "",
  imported: { lessons: 0, modules: 0, exams: 0 },
};

export async function importLearningProgress(
  _state: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { ...initialImportState, message: "No pudimos leer el progreso local." };
  }

  const validation = validateImportPayload(parsed);
  if (!validation.ok) {
    return { ...initialImportState, message: validation.message };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ...initialImportState, message: "Supabase no está configurado." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ...initialImportState, message: "Inicia sesión antes de importar." };

  const local = validation.value;
  const lessonSlugs = Object.keys(local.completedLessons);
  const moduleSlugs = new Set([
    ...Object.keys(local.moduleStates),
    ...local.examAttempts.map((attempt) => attempt.moduleSlug),
  ]);

  const { data: lessons, error: lessonLookupError } = lessonSlugs.length
    ? await supabase.from("lessons").select("id, slug").in("slug", lessonSlugs)
    : { data: [], error: null };
  const { data: modules, error: moduleLookupError } = moduleSlugs.size
    ? await supabase.from("modules").select("id, slug").in("slug", [...moduleSlugs])
    : { data: [], error: null };

  if (lessonLookupError || moduleLookupError) {
    return { ...initialImportState, message: "No pudimos relacionar el progreso con el curso." };
  }

  const moduleIds = new Map((modules ?? []).map((item) => [item.slug, item.id]));
  const progressRows = (lessons ?? []).map((lesson) => ({
    user_id: user.id,
    lesson_id: lesson.id,
    status: "completed",
    completed_at: local.completedLessons[lesson.slug],
    updated_at: local.completedLessons[lesson.slug],
  }));
  const stateRows = Object.entries(local.moduleStates)
    .filter(([slug]) => moduleIds.has(slug))
    .map(([slug, state]) => ({
      user_id: user.id,
      module_id: moduleIds.get(slug),
      state,
      updated_at: new Date().toISOString(),
    }));
  const examRows = local.examAttempts
    .filter((attempt) => moduleIds.has(attempt.moduleSlug))
    .map((attempt) => ({
      user_id: user.id,
      module_id: moduleIds.get(attempt.moduleSlug),
      source_attempt_id: attempt.id,
      correct: attempt.correct,
      incorrect: attempt.incorrect,
      unanswered: attempt.unanswered,
      total: attempt.total,
      percent: attempt.percent,
      passed: attempt.passed,
      answers: attempt.answers,
      created_at: attempt.createdAt,
    }));

  const results = await Promise.all([
    progressRows.length
      ? supabase.from("lesson_progress").upsert(progressRows, { onConflict: "user_id,lesson_id" })
      : Promise.resolve({ error: null }),
    stateRows.length
      ? supabase.from("learning_states").upsert(stateRows, { onConflict: "user_id,module_id" })
      : Promise.resolve({ error: null }),
    examRows.length
      ? supabase.from("exam_attempts").upsert(examRows, { onConflict: "user_id,source_attempt_id" })
      : Promise.resolve({ error: null }),
  ]);

  if (results.some((result) => result.error)) {
    return { ...initialImportState, message: "La importación quedó incompleta. Inténtalo nuevamente." };
  }

  return {
    success: true,
    message: "Tu progreso visitante quedó sincronizado con la cuenta.",
    imported: {
      lessons: progressRows.length,
      modules: stateRows.length,
      exams: examRows.length,
    },
  };
}
