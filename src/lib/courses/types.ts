import type { CourseModule, CourseSeed } from "@/lib/course";

export type CourseTheme = "academia-ia" | "ai-engineering";

export type ProgressUnit = {
  id: string;
  order: number;
  sourceKey: string;
};

export type ModuleSummary = {
  slug: string;
  order: number;
  title: string;
  status?: string;
  estimatedStudyMinutes?: number;
  progressUnits: ProgressUnit[];
};

export type CourseSummary = {
  slug: string;
  title: string;
  theme: CourseTheme;
  modules: ModuleSummary[];
  category?: string;
  description?: string;
  duration?: string;
  audience?: string;
};

export type AiEngineeringSourceAsset = {
  sourcePath: string;
};

export type AiEngineeringPublicAsset = AiEngineeringSourceAsset & {
  publicPath: string;
  mediaType: string;
};

export type AiEngineeringCaseAsset = AiEngineeringSourceAsset & {
  id: string;
};

export type AiEngineeringAssets = {
  contentHtml: AiEngineeringSourceAsset;
  visualAudioHtml: AiEngineeringSourceAsset;
  infographic: AiEngineeringPublicAsset;
  audioMp3: AiEngineeringPublicAsset;
  audioM4a: AiEngineeringSourceAsset;
  audioScript: AiEngineeringSourceAsset;
  presentation: AiEngineeringPublicAsset;
  cases: AiEngineeringCaseAsset[];
};

export type AiEngineeringPreparedSection = {
  id: string;
  title: string;
  html: string;
};

export type AiEngineeringPreparedHtml = {
  title: string;
  html: string;
  introHtml: string;
  footerHtml: string;
  sections: AiEngineeringPreparedSection[];
};

export type AiEngineeringPreparedCase = AiEngineeringPreparedHtml & {
  id: string;
};

export type AiEngineeringContent = {
  foundational: AiEngineeringPreparedHtml;
  visualAudio: AiEngineeringPreparedHtml;
  audioScript: string;
  cases: AiEngineeringPreparedCase[];
};

export type AiEngineeringModule = {
  summary: ModuleSummary;
  status: string;
  estimatedStudyMinutes: number;
  learningPath: ProgressUnit[];
  assets: AiEngineeringAssets;
  content: AiEngineeringContent;
};

export type PreparedAiEngineeringModule = {
  sourceVersion: string;
  courseSlug: string;
  moduleSlug: string;
  assets: AiEngineeringAssets;
  content: AiEngineeringContent;
};

export type StandardCourseDefinition = {
  kind: "standard";
  summary: CourseSummary;
  course: CourseSeed;
  modules: CourseModule[];
};

export type AiEngineeringCourseDefinition = {
  kind: "ai-engineering";
  summary: CourseSummary;
  sourceVersion: string;
  modules: AiEngineeringModule[];
};

export type CourseDefinition = StandardCourseDefinition | AiEngineeringCourseDefinition;

export type ResolvedCourseModule =
  | {
      kind: "standard";
      course: StandardCourseDefinition;
      module: CourseModule;
      summary: ModuleSummary;
    }
  | {
      kind: "ai-engineering";
      course: AiEngineeringCourseDefinition;
      module: AiEngineeringModule;
      summary: ModuleSummary;
    };
