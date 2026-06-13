import { getSqlite } from "@/db/client";

export function getLatestExamAttempt(moduleSlug: string) {
  return getSqlite()
    .prepare(
       `SELECT module_slug, correct, incorrect, unanswered, total, percent, passed, created_at
       FROM exam_attempts
       WHERE module_slug = ?
       ORDER BY created_at DESC
       LIMIT 1`,
    )
    .get(moduleSlug) as
    | {
        module_slug: string;
        correct: number;
        incorrect: number;
        unanswered: number;
        total: number;
        percent: number;
        passed: number;
        created_at: string;
      }
    | undefined;
}
