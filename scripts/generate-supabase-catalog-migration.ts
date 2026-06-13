import fs from "node:fs";
import path from "node:path";
import { courseSeed } from "../src/lib/course-seed";

const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;
const catalog = {
  modules: courseSeed.modules.map((courseModule) => ({
    slug: courseModule.slug,
    title: courseModule.title,
    purpose: courseModule.purpose,
    module_order: courseModule.order,
    duration: courseModule.duration,
    product: courseModule.product,
    certificate_hours: courseModule.certificateHours,
  })),
  lessons: courseSeed.modules.flatMap((courseModule) =>
    courseModule.lessons.map((lesson) => ({
      module_slug: courseModule.slug,
      slug: lesson.slug,
      title: lesson.title,
      lesson_order: lesson.order,
      lesson_type: lesson.type,
      summary: lesson.summary,
    })),
  ),
};
const payload = quote(JSON.stringify(catalog));
const lines = [
  `insert into public.courses (slug, title, category, description, duration, is_published)`,
  `values (${quote(courseSeed.slug)}, ${quote(courseSeed.title)}, ${quote(courseSeed.category)}, ${quote(courseSeed.description)}, ${quote(courseSeed.duration)}, true)`,
  `on conflict (slug) do update set title = excluded.title, category = excluded.category, description = excluded.description, duration = excluded.duration, is_published = true;`,
  "",
  `with payload as (select ${payload}::jsonb as value)`,
  `insert into public.modules (course_id, slug, title, purpose, module_order, duration, product, certificate_hours, is_published)`,
  `select c.id, item.slug, item.title, item.purpose, item.module_order, item.duration, item.product, item.certificate_hours, true`,
  `from payload, jsonb_to_recordset(payload.value -> 'modules') as item(slug text, title text, purpose text, module_order integer, duration text, product text, certificate_hours integer)`,
  `cross join public.courses c where c.slug = ${quote(courseSeed.slug)}`,
  `on conflict (slug) do update set title = excluded.title, purpose = excluded.purpose, module_order = excluded.module_order, duration = excluded.duration, product = excluded.product, certificate_hours = excluded.certificate_hours, is_published = true;`,
  "",
  `with payload as (select ${payload}::jsonb as value)`,
  `insert into public.lessons (module_id, slug, title, lesson_order, lesson_type, summary, content, is_published)`,
  `select m.id, item.slug, item.title, item.lesson_order, item.lesson_type, item.summary, item.summary, true`,
  `from payload, jsonb_to_recordset(payload.value -> 'lessons') as item(module_slug text, slug text, title text, lesson_order integer, lesson_type text, summary text)`,
  `join public.modules m on m.slug = item.module_slug`,
  `on conflict (slug) do update set title = excluded.title, lesson_order = excluded.lesson_order, lesson_type = excluded.lesson_type, summary = excluded.summary, content = excluded.content, is_published = true;`,
  "",
];

const output = path.join(
  process.cwd(),
  "supabase",
  "migrations",
  "20260613203100_seed_course_catalog.sql",
);
fs.writeFileSync(output, `${lines.join("\n")}\n`, "utf8");
console.log(output);
