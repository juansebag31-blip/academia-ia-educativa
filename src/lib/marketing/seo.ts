import { courseSeed } from "@/lib/course-seed";

export function getCanonicalOrigin(value = process.env.NEXT_PUBLIC_APP_URL) {
  return (value?.trim() || "http://localhost:3000").replace(/\/+$/, "");
}

export function buildCourseJsonLd(origin = getCanonicalOrigin()) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: courseSeed.title,
    description: courseSeed.description,
    url: `${origin}/`,
    inLanguage: "es",
    isAccessibleForFree: true,
    educationalLevel: "Principiante",
    about: [
      "Inteligencia artificial",
      "NotebookLM",
      "Tecnología educativa",
    ],
    provider: {
      "@type": "Organization",
      name: "Academia IA Educativa",
      url: `${origin}/`,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT22H",
      inLanguage: "es",
    },
  };
}
