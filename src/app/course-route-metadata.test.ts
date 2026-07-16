import { describe, expect, it } from "vitest";
import { resolveCourse, resolveCourseModule } from "@/lib/courses/catalog";
import { generateMetadata as generateCourseMetadata } from "./(app)/courses/[courseSlug]/page";
import { generateMetadata as generateModuleMetadata } from "./(app)/courses/[courseSlug]/modules/[moduleSlug]/page";

describe("multicourse route metadata", () => {
  it.each(["ai-engineering-aplicado", "ia-educativa-notebooklm"])(
    "uses existing catalog data for %s",
    async (courseSlug) => {
      const course = resolveCourse(courseSlug);
      if (!course) throw new Error(`Missing course fixture: ${courseSlug}`);

      const metadata = await generateCourseMetadata({ params: Promise.resolve({ courseSlug }) });
      expect(metadata.title).toBe(course.summary.title);
      expect(metadata.description).toBe(course.summary.description ?? course.summary.title);
    },
  );

  it.each([
    ["ai-engineering-aplicado", "modulo-01"],
    ["ia-educativa-notebooklm", "modulo-1-introduccion-historica-ia"],
  ])("uses existing module data for %s/%s", async (courseSlug, moduleSlug) => {
    const resolved = resolveCourseModule(courseSlug, moduleSlug);
    if (!resolved) throw new Error(`Missing module fixture: ${courseSlug}/${moduleSlug}`);

    const metadata = await generateModuleMetadata({
      params: Promise.resolve({ courseSlug, moduleSlug }),
    });
    expect(metadata.title).toBe(resolved.summary.title);
    expect(metadata.description).toBe(
      resolved.kind === "standard" ? resolved.module.purpose : resolved.summary.title,
    );
  });
});
