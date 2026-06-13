export type LessonStatus = "not_started" | "in_progress" | "completed";
export type LessonType = "theory" | "activity" | "assessment" | "project";

export type CourseSeed = {
  slug: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  audience: string;
  modules: CourseModule[];
};

export type CourseModule = {
  slug: string;
  order: number;
  title: string;
  purpose: string;
  duration: string;
  certificateHours: number;
  product: string;
  pdfFile: string;
  image: ModuleImage;
  lessons: Lesson[];
  examQuestions: ExamQuestion[];
  videos: VideoResource[];
  promptTemplates: PromptTemplate[];
  masteryChecklist: MasteryItem[];
  lab: PracticalLab;
  flashcards: Flashcard[];
  guidedPath: GuidedStep[];
  studentNotebook: NotebookPrompt[];
  practiceQuiz: PracticeQuestion[];
  rubric: RubricLevel[];
  simulator: SimulatorStep[];
};

export type Lesson = {
  slug: string;
  order: number;
  title: string;
  type: LessonType;
  summary: string;
  content: string;
  checklist: string[];
};

export type ExamOption = {
  id: string;
  text: string;
};

export type ExamQuestion = {
  id: string;
  prompt: string;
  options: ExamOption[];
  correctOptionId: string;
  explanation: string;
};

export type VideoResource = {
  title: string;
  provider: "YouTube";
  url: string;
  embedUrl: string;
  startSeconds?: number;
  thumbnailUrl: string;
  posterSrc: string;
  channel: string;
  reason: string;
};

export type ModuleImage = {
  src: string;
  alt: string;
  credit: string;
};

export type PromptTemplate = {
  id: string;
  title: string;
  useCase: string;
  prompt: string;
};

export type MasteryItem = {
  id: string;
  text: string;
};

export type PracticalLab = {
  title: string;
  objective: string;
  steps: string[];
  deliverable: string;
};

export type Flashcard = {
  id: string;
  front: string;
  back: string;
};

export type GuidedStep = {
  id: string;
  title: string;
  description: string;
};

export type NotebookPrompt = {
  id: string;
  label: string;
  placeholder: string;
};

export type PracticeQuestion = {
  id: string;
  question: string;
  answer: string;
};

export type RubricLevel = {
  level: "Básico" | "Correcto" | "Excelente";
  criteria: string;
};

export type SimulatorStep = {
  id: string;
  title: string;
  instruction: string;
};

export type ProgressEntry = {
  lessonSlug: string;
  status: LessonStatus;
};

export type ProgressSummary = {
  completed: number;
  total: number;
  percent: number;
};

export type SearchResult = {
  type: "course" | "module" | "lesson";
  title: string;
  href: string;
  excerpt: string;
};

export function getAllLessons(course: CourseSeed): Lesson[] {
  return course.modules
    .sort((a, b) => a.order - b.order)
    .flatMap((courseModule) =>
      courseModule.lessons
        .sort((a, b) => a.order - b.order)
        .map((lesson) => ({ ...lesson })),
    );
}

export function calculateCourseProgress(progress: ProgressEntry[]): ProgressSummary {
  const total = progress.length;
  const completed = progress.filter((entry) => entry.status === "completed").length;

  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function findAdjacentLessons(course: CourseSeed, currentSlug: string) {
  const lessons = getAllLessons(course);
  const index = lessons.findIndex((lesson) => lesson.slug === currentSlug);

  return {
    previous: index > 0 ? lessons[index - 1] : null,
    current: index >= 0 ? lessons[index] : null,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null,
  };
}

export function findAdjacentModules(course: CourseSeed, currentSlug: string) {
  const modules = [...course.modules].sort((a, b) => a.order - b.order);
  const index = modules.findIndex((courseModule) => courseModule.slug === currentSlug);

  return {
    previous: index > 0 ? modules[index - 1] : null,
    current: index >= 0 ? modules[index] : null,
    next: index >= 0 && index < modules.length - 1 ? modules[index + 1] : null,
  };
}

export function findModuleBySlug(course: CourseSeed, moduleSlug: string) {
  return course.modules.find((courseModule) => courseModule.slug === moduleSlug) ?? null;
}

export function findLessonBySlug(course: CourseSeed, lessonSlug: string) {
  for (const courseModule of course.modules) {
    const lesson = courseModule.lessons.find((candidate) => candidate.slug === lessonSlug);
    if (lesson) {
      return { module: courseModule, lesson };
    }
  }

  return null;
}

export function searchCourseCatalog(course: CourseSeed, query: string): SearchResult[] {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (terms.length === 0) {
    return [];
  }

  const matches = (text: string) => terms.every((term) => normalize(text).includes(term));
  const results: SearchResult[] = [];

  if (matches(`${course.title} ${course.description} ${course.category}`)) {
    results.push({
      type: "course",
      title: course.title,
      href: `/courses/${course.slug}`,
      excerpt: course.description,
    });
  }

  for (const courseModule of course.modules) {
    const moduleText = `${courseModule.title} ${courseModule.purpose} ${courseModule.product}`;
    if (matches(moduleText)) {
      results.push({
        type: "module",
        title: courseModule.title,
        href: `/courses/${course.slug}/modules/${courseModule.slug}`,
        excerpt: courseModule.purpose,
      });
    }

    for (const lesson of courseModule.lessons) {
      const lessonText = `${courseModule.title} ${lesson.title} ${lesson.summary} ${lesson.content}`;
      if (matches(lessonText)) {
        results.push({
          type: "lesson",
          title: lesson.title,
          href: `/courses/${course.slug}/lessons/${lesson.slug}`,
          excerpt: lesson.summary,
        });
      }
    }
  }

  return results.slice(0, 12);
}

export function validateCourseSeed(course: CourseSeed) {
  const slugs = [
    course.slug,
    ...course.modules.map((courseModule) => courseModule.slug),
    ...course.modules.flatMap((courseModule) => courseModule.lessons.map((lesson) => lesson.slug)),
  ];
  const seen = new Set<string>();
  const duplicateSlugs = slugs.filter((slug) => {
    if (seen.has(slug)) {
      return true;
    }
    seen.add(slug);
    return false;
  });

  return {
    moduleCount: course.modules.length,
    lessonCount: course.modules.reduce((total, courseModule) => total + courseModule.lessons.length, 0),
    duplicateSlugs,
  };
}

export function getProgressEntries(course: CourseSeed, completedSlugs: Set<string>, activeSlug?: string) {
  return getAllLessons(course).map((lesson) => ({
    lessonSlug: lesson.slug,
    status: completedSlugs.has(lesson.slug)
      ? "completed"
      : lesson.slug === activeSlug
        ? "in_progress"
        : "not_started",
  })) satisfies ProgressEntry[];
}

export function getModuleProgress(courseModule: CourseModule, completedSlugs: Set<string>) {
  return calculateCourseProgress(
    courseModule.lessons.map((lesson) => ({
      lessonSlug: lesson.slug,
      status: completedSlugs.has(lesson.slug) ? "completed" : "not_started",
    })),
  );
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
