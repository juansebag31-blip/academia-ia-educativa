import { describe, expect, it } from "vitest";
import { courseSeed } from "@/lib/course-seed";
import {
  courseCatalog,
  getCourseRouteParams,
  getModuleRouteParams,
  resolveCourse,
  resolveCourseModule,
} from "./catalog";

describe("multi-course catalog", () => {
  it("resolves the existing course without changing its source data", () => {
    const course = resolveCourse(courseSeed.slug);

    expect(course?.kind).toBe("standard");
    if (!course || course.kind !== "standard") throw new Error("Existing course was not resolved.");
    expect(course.course).toBe(courseSeed);
    expect(course.modules).toBe(courseSeed.modules);
  });

  it("resolves AI Engineering and its first module", () => {
    const course = resolveCourse("ai-engineering-aplicado");
    const resolvedModule = resolveCourseModule("ai-engineering-aplicado", "modulo-01");

    expect(course?.kind).toBe("ai-engineering");
    expect(resolvedModule?.kind).toBe("ai-engineering");
    expect(resolvedModule?.summary.title).toBe("De un modelo a un sistema inteligente");
  });

  it("returns null for unknown course and module routes", () => {
    expect(resolveCourse("unknown-course")).toBeNull();
    expect(resolveCourseModule(courseSeed.slug, "unknown-module")).toBeNull();
    expect(resolveCourseModule("unknown-course", "modulo-01")).toBeNull();
  });

  it("exposes static route params for both course kinds", () => {
    expect(courseCatalog).toHaveLength(2);
    expect(getCourseRouteParams()).toEqual(
      expect.arrayContaining([
        { courseSlug: courseSeed.slug },
        { courseSlug: "ai-engineering-aplicado" },
      ]),
    );
    expect(getModuleRouteParams()).toContainEqual({
      courseSlug: "ai-engineering-aplicado",
      moduleSlug: "modulo-01",
    });
  });
});
