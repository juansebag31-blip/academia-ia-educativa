"use client";

import { CheckCircle2 } from "lucide-react";
import type { CourseModule } from "@/lib/course";
import { calculateCourseProgress, getModuleProgress } from "@/lib/course";
import { courseSeed } from "@/lib/course-seed";
import { useCompletedLessonSlugs } from "@/lib/learning/use-local-progress";
import { ProgressBar } from "@/components/progress-bar";

export function LocalCourseProgress({ showCount = false }: { showCount?: boolean }) {
  const completed = useCompletedLessonSlugs();
  const entries = courseSeed.modules.flatMap((courseModule) =>
    courseModule.lessons.map((lesson) => ({
      lessonSlug: lesson.slug,
      status: completed.has(lesson.slug) ? "completed" as const : "not_started" as const,
    })),
  );
  const progress = calculateCourseProgress(entries);

  return (
    <div>
      <div className="flex items-end justify-between gap-5">
        <p className="text-4xl font-black">{progress.percent}%</p>
        {showCount ? (
          <p className="text-sm font-semibold text-slate-500">
            {progress.completed} de {progress.total} lecciones
          </p>
        ) : null}
      </div>
      <div className="mt-3"><ProgressBar percent={progress.percent} /></div>
    </div>
  );
}

export function LocalModuleProgress({
  courseModule,
  showCount = true,
}: {
  courseModule: CourseModule;
  showCount?: boolean;
}) {
  const completed = useCompletedLessonSlugs();
  const progress = getModuleProgress(courseModule, completed);
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        {showCount ? <span>{progress.completed}/{progress.total} completadas</span> : <span>Progreso</span>}
        <span>{progress.percent}%</span>
      </div>
      <div className="mt-2"><ProgressBar percent={progress.percent} /></div>
    </div>
  );
}

export function LocalLessonStatus({ lessonSlug }: { lessonSlug: string }) {
  const completed = useCompletedLessonSlugs();
  return (
    <span className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
      completed.has(lessonSlug) ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
    }`}>
      <CheckCircle2 size={20} />
    </span>
  );
}
