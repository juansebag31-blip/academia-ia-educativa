import { describe, expect, it } from "vitest";
import { generateMetadata as generateCourseMetadata } from "./(app)/courses/[courseSlug]/page";
import { generateMetadata as generateModuleMetadata } from "./(app)/courses/[courseSlug]/modules/[moduleSlug]/page";
import {
  AI_ENGINEERING_COURSE_DESCRIPTION,
  AI_ENGINEERING_COURSE_IMAGE,
  AI_ENGINEERING_PUBLIC_ORIGIN,
  aiEngineeringModulePublication,
} from "@/lib/courses/ai-engineering/publication";
import { resolveCourse, resolveCourseModule } from "@/lib/courses/catalog";

describe("multicourse route metadata", () => {
  it("preserves the original course metadata", async () => {
    const courseSlug = "ia-educativa-notebooklm";
    const course = resolveCourse(courseSlug);
    if (!course) throw new Error(`Missing course fixture: ${courseSlug}`);

    const metadata = await generateCourseMetadata({
      params: Promise.resolve({ courseSlug }),
    });
    expect(metadata.title).toBe(course.summary.title);
    expect(metadata.description).toBe(
      course.summary.description ?? course.summary.title,
    );
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).toBeUndefined();
    expect(metadata.twitter).toBeUndefined();
  });

  it("builds complete metadata for the AI Engineering landing", async () => {
    const metadata = await generateCourseMetadata({
      params: Promise.resolve({
        courseSlug: "ai-engineering-aplicado",
      }),
    });

    expect(metadata.title).toBe("AI Engineering Aplicado");
    expect(metadata.description).toBe(AI_ENGINEERING_COURSE_DESCRIPTION);
    expect(metadata.alternates?.canonical).toBe(
      `${AI_ENGINEERING_PUBLIC_ORIGIN}/courses/ai-engineering-aplicado`,
    );
    expect(metadata.openGraph).toMatchObject({
      title: "AI Engineering Aplicado",
      description: AI_ENGINEERING_COURSE_DESCRIPTION,
      url: `${AI_ENGINEERING_PUBLIC_ORIGIN}/courses/ai-engineering-aplicado`,
    });
    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({
        url: `${AI_ENGINEERING_PUBLIC_ORIGIN}${AI_ENGINEERING_COURSE_IMAGE}`,
        alt: expect.stringContaining("AI Engineering Aplicado"),
      }),
    ]);
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "AI Engineering Aplicado",
      description: AI_ENGINEERING_COURSE_DESCRIPTION,
    });
  });

  it("preserves the original module metadata", async () => {
    const courseSlug = "ia-educativa-notebooklm";
    const moduleSlug = "modulo-1-introduccion-historica-ia";
    const resolved = resolveCourseModule(courseSlug, moduleSlug);
    if (!resolved || resolved.kind !== "standard") {
      throw new Error(`Missing module fixture: ${courseSlug}/${moduleSlug}`);
    }

    const metadata = await generateModuleMetadata({
      params: Promise.resolve({ courseSlug, moduleSlug }),
    });
    expect(metadata.title).toBe(resolved.summary.title);
    expect(metadata.description).toBe(resolved.module.purpose);
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).toBeUndefined();
    expect(metadata.twitter).toBeUndefined();
  });

  it("builds unique complete metadata for all AI Engineering routes", async () => {
    const course = resolveCourse("ai-engineering-aplicado");
    if (!course || course.kind !== "ai-engineering") {
      throw new Error("Missing AI Engineering course fixture.");
    }

    const courseMetadata = await generateCourseMetadata({
      params: Promise.resolve({
        courseSlug: "ai-engineering-aplicado",
      }),
    });
    const routeMetadata = [courseMetadata];

    for (const courseModule of course.modules) {
      const publication =
        aiEngineeringModulePublication[courseModule.summary.slug];
      const canonicalPath =
        `${AI_ENGINEERING_PUBLIC_ORIGIN}/courses/ai-engineering-aplicado/modules/${courseModule.summary.slug}`;
      const metadata = await generateModuleMetadata({
        params: Promise.resolve({
          courseSlug: "ai-engineering-aplicado",
          moduleSlug: courseModule.summary.slug,
        }),
      });

      expect(metadata.title).toBe(courseModule.summary.title);
      expect(metadata.description).toBe(publication.description);
      expect(metadata.alternates?.canonical).toBe(canonicalPath);
      expect(metadata.openGraph).toMatchObject({
        title: courseModule.summary.title,
        description: publication.description,
        url: canonicalPath,
      });
      expect(metadata.openGraph?.images).toEqual([
        expect.objectContaining({
          url: `${AI_ENGINEERING_PUBLIC_ORIGIN}${publication.imageSrc}`,
          alt: `Portada del Módulo ${courseModule.summary.order}: ${courseModule.summary.title}`,
        }),
      ]);
      expect(metadata.twitter).toMatchObject({
        card: "summary_large_image",
        title: courseModule.summary.title,
        description: publication.description,
      });
      routeMetadata.push(metadata);
    }

    expect(new Set(routeMetadata.map(({ title }) => title)).size).toBe(13);
    expect(
      new Set(routeMetadata.map(({ description }) => description)).size,
    ).toBe(13);
    expect(
      new Set(
        routeMetadata.map(({ alternates }) => alternates?.canonical),
      ).size,
    ).toBe(13);
  });
});
