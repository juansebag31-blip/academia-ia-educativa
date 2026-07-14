import { courseSeed } from "@/lib/course-seed";
import { aiEngineeringModuleOne } from "@/lib/courses/ai-engineering/module-01";
import {
  AI_ENGINEERING_COURSE_SLUG,
  aiEngineeringManifest,
} from "@/lib/courses/ai-engineering/manifest";
import type {
  AiEngineeringCourseDefinition,
  CourseDefinition,
  CourseSummary,
  ModuleSummary,
  ResolvedCourseModule,
  StandardCourseDefinition,
} from "@/lib/courses/types";

const standardModuleSummaries: ModuleSummary[] = courseSeed.modules.map((courseModule) => ({
  slug: courseModule.slug,
  order: courseModule.order,
  title: courseModule.title,
  progressUnits: courseModule.lessons.map((lesson) => ({
    id: lesson.slug,
    order: lesson.order,
    sourceKey: lesson.slug,
  })),
}));

const standardSummary: CourseSummary = {
  slug: courseSeed.slug,
  title: courseSeed.title,
  theme: "academia-ia",
  category: courseSeed.category,
  description: courseSeed.description,
  duration: courseSeed.duration,
  audience: courseSeed.audience,
  modules: standardModuleSummaries,
};

const standardCourse: StandardCourseDefinition = {
  kind: "standard",
  summary: standardSummary,
  course: courseSeed,
  modules: courseSeed.modules,
};

const aiEngineeringCourse: AiEngineeringCourseDefinition = {
  kind: "ai-engineering",
  summary: {
    slug: AI_ENGINEERING_COURSE_SLUG,
    title: aiEngineeringManifest.course,
    theme: "ai-engineering",
    duration: `${aiEngineeringManifest.module.estimatedStudyMinutes} minutos`,
    modules: [aiEngineeringModuleOne.summary],
  },
  sourceVersion: aiEngineeringManifest.version,
  modules: [aiEngineeringModuleOne],
};

export const courseCatalog: CourseDefinition[] = [standardCourse, aiEngineeringCourse];

export function resolveCourse(courseSlug: string) {
  return courseCatalog.find((course) => course.summary.slug === courseSlug) ?? null;
}

export function resolveCourseModule(courseSlug: string, moduleSlug: string): ResolvedCourseModule | null {
  const course = resolveCourse(courseSlug);
  if (!course) return null;

  if (course.kind === "standard") {
    const courseModule = course.modules.find((candidate) => candidate.slug === moduleSlug);
    const summary = course.summary.modules.find((candidate) => candidate.slug === moduleSlug);
    return courseModule && summary
      ? { kind: "standard", course, module: courseModule, summary }
      : null;
  }

  const aiModule = course.modules.find((candidate) => candidate.summary.slug === moduleSlug);
  return aiModule
    ? { kind: "ai-engineering", course, module: aiModule, summary: aiModule.summary }
    : null;
}

export function getCourseRouteParams() {
  return courseCatalog.map((course) => ({ courseSlug: course.summary.slug }));
}

export function getModuleRouteParams() {
  return courseCatalog.flatMap((course) =>
    course.summary.modules.map((module) => ({
      courseSlug: course.summary.slug,
      moduleSlug: module.slug,
    })),
  );
}
