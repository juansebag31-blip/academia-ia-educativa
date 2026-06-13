import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
});

export const modules = sqliteTable("modules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseSlug: text("course_slug").notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  purpose: text("purpose").notNull(),
  moduleOrder: integer("module_order").notNull(),
  duration: text("duration").notNull(),
  product: text("product").notNull(),
  pdfFile: text("pdf_file").notNull(),
});

export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleSlug: text("module_slug").notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  lessonOrder: integer("lesson_order").notNull(),
  type: text("type").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
});

export const progress = sqliteTable(
  "progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    lessonSlug: text("lesson_slug").notNull(),
    status: text("status").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    lessonSlugIndex: uniqueIndex("progress_lesson_slug_idx").on(table.lessonSlug),
  }),
);

export const resources = sqliteTable("resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerSlug: text("owner_slug").notNull(),
  title: text("title").notNull(),
  filePath: text("file_path").notNull(),
  resourceType: text("resource_type").notNull(),
});

export const examAttempts = sqliteTable("exam_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleSlug: text("module_slug").notNull(),
  correct: integer("correct").notNull(),
  incorrect: integer("incorrect").notNull(),
  unanswered: integer("unanswered").notNull(),
  total: integer("total").notNull(),
  percent: integer("percent").notNull(),
  passed: integer("passed").notNull(),
  createdAt: text("created_at").notNull(),
});
