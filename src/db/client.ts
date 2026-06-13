import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { courseSeed } from "@/lib/course-seed";
import * as schema from "./schema";

const dbPath = path.join(process.cwd(), "data", "academy.sqlite");
let sqlite: Database.Database | null = null;

export function getDb() {
  if (!sqlite) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    initializeDatabase(sqlite);
  }

  return drizzle(sqlite, { schema });
}

export function getSqlite() {
  if (!sqlite) {
    getDb();
  }

  return sqlite as Database.Database;
}

export function initializeDatabase(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      duration TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_slug TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      purpose TEXT NOT NULL,
      module_order INTEGER NOT NULL,
      duration TEXT NOT NULL,
      product TEXT NOT NULL,
      pdf_file TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_slug TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      lesson_order INTEGER NOT NULL,
      type TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_slug TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_slug TEXT NOT NULL,
      title TEXT NOT NULL,
      file_path TEXT NOT NULL,
      resource_type TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS exam_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_slug TEXT NOT NULL,
      correct INTEGER NOT NULL,
      incorrect INTEGER NOT NULL,
      unanswered INTEGER NOT NULL,
      total INTEGER NOT NULL,
      percent INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  seedCatalog(db);
}

function seedCatalog(db: Database.Database) {
  const insertCourse = db.prepare(`
    INSERT INTO courses (slug, title, category, description, duration)
    VALUES (@slug, @title, @category, @description, @duration)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      category = excluded.category,
      description = excluded.description,
      duration = excluded.duration
  `);

  insertCourse.run(courseSeed);

  const insertModule = db.prepare(`
    INSERT INTO modules (course_slug, slug, title, purpose, module_order, duration, product, pdf_file)
    VALUES (@courseSlug, @slug, @title, @purpose, @moduleOrder, @duration, @product, @pdfFile)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      purpose = excluded.purpose,
      module_order = excluded.module_order,
      duration = excluded.duration,
      product = excluded.product,
      pdf_file = excluded.pdf_file
  `);

  const insertLesson = db.prepare(`
    INSERT INTO lessons (module_slug, slug, title, lesson_order, type, summary, content)
    VALUES (@moduleSlug, @slug, @title, @lessonOrder, @type, @summary, @content)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      lesson_order = excluded.lesson_order,
      type = excluded.type,
      summary = excluded.summary,
      content = excluded.content
  `);

  const insertResource = db.prepare(`
    INSERT INTO resources (owner_slug, title, file_path, resource_type)
    SELECT @ownerSlug, @title, @filePath, @resourceType
    WHERE NOT EXISTS (
      SELECT 1 FROM resources WHERE owner_slug = @ownerSlug AND file_path = @filePath
    )
  `);

  for (const courseModule of courseSeed.modules) {
    insertModule.run({
      courseSlug: courseSeed.slug,
      slug: courseModule.slug,
      title: courseModule.title,
      purpose: courseModule.purpose,
      moduleOrder: courseModule.order,
      duration: courseModule.duration,
      product: courseModule.product,
      pdfFile: courseModule.pdfFile,
    });

    insertResource.run({
      ownerSlug: courseModule.slug,
      title: `PDF - ${courseModule.title}`,
      filePath: `/course-assets/pdfs/${encodeURIComponent(courseModule.pdfFile)}`,
      resourceType: "pdf",
    });

    for (const video of courseModule.videos) {
      insertResource.run({
        ownerSlug: courseModule.slug,
        title: video.title,
        filePath: video.url,
        resourceType: "video",
      });
    }

    for (const lesson of courseModule.lessons) {
      insertLesson.run({
        moduleSlug: courseModule.slug,
        slug: lesson.slug,
        title: lesson.title,
        lessonOrder: lesson.order,
        type: lesson.type,
        summary: lesson.summary,
        content: lesson.content,
      });
    }
  }
}
