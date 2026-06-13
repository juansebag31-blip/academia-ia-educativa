import { revalidatePath } from "next/cache";
import { getSqlite } from "@/db/client";
import { courseSeed } from "./course-seed";
import { findLessonBySlug, getAllLessons, getProgressEntries } from "./course";

export function getCompletedLessonSlugs() {
  const rows = getSqlite()
    .prepare("SELECT lesson_slug FROM progress WHERE status = 'completed'")
    .all() as Array<{ lesson_slug: string }>;

  return new Set(rows.map((row) => row.lesson_slug));
}

export function getLastLessonSlug() {
  const row = getSqlite()
    .prepare("SELECT lesson_slug FROM progress ORDER BY updated_at DESC LIMIT 1")
    .get() as { lesson_slug: string } | undefined;

  return row?.lesson_slug ?? getAllLessons(courseSeed)[0]?.slug;
}

export function getProgressForCourse() {
  return getProgressEntries(courseSeed, getCompletedLessonSlugs(), getLastLessonSlug());
}

export async function markLessonCompleted(lessonSlug: string) {
  "use server";

  const found = findLessonBySlug(courseSeed, lessonSlug);
  if (!found) {
    throw new Error("Lesson not found");
  }

  getSqlite()
    .prepare(
      `INSERT INTO progress (lesson_slug, status, updated_at)
       VALUES (?, 'completed', ?)
       ON CONFLICT(lesson_slug) DO UPDATE SET
         status = 'completed',
         updated_at = excluded.updated_at`,
    )
    .run(lessonSlug, new Date().toISOString());

  revalidatePath("/");
  revalidatePath(`/courses/${courseSeed.slug}`);
  revalidatePath(`/courses/${courseSeed.slug}/lessons/${lessonSlug}`);
}

export async function touchLessonProgress(lessonSlug: string) {
  "use server";

  getSqlite()
    .prepare(
      `INSERT INTO progress (lesson_slug, status, updated_at)
       VALUES (?, 'in_progress', ?)
       ON CONFLICT(lesson_slug) DO UPDATE SET
         updated_at = excluded.updated_at`,
    )
    .run(lessonSlug, new Date().toISOString());
}
