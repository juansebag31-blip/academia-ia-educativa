import type { CourseModule, CourseSeed } from "@/lib/course";
import type {
  AiEngineeringCourseModulePlan,
  AiEngineeringModuleManifest,
  AiEngineeringProgressKind,
  AiEngineeringVisualPlacement,
  AiEngineeringKeyIdea,
} from "@/lib/courses/ai-engineering/module-contract";

export type CourseTheme = "academia-ia" | "ai-engineering";

export type ProgressUnit = {
  id: string;
  order: number;
  sourceKey: string;
  sectionId?: string;
  label?: string;
  kind?: AiEngineeringProgressKind;
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
  visualAudioHtml?: AiEngineeringSourceAsset;
  infographic: AiEngineeringPublicAsset;
  audioMp3: AiEngineeringPublicAsset;
  audioM4a?: AiEngineeringSourceAsset;
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
  visualAudio?: AiEngineeringPreparedHtml;
  audioScript: string;
  cases: AiEngineeringPreparedCase[];
};

export type AiEngineeringModule = {
  summary: ModuleSummary;
  editorialSlug: string;
  editorialStatus: AiEngineeringModuleManifest["module"]["editorialStatus"];
  publish: boolean;
  level: string;
  estimatedStudyMinutes: number;
  learningPath: ProgressUnit[];
  assets: AiEngineeringAssets;
  content: AiEngineeringContent;
  configuration: AiEngineeringModuleManifest["module"];
  presentation: AiEngineeringPresentationConfig;
  visuals: AiEngineeringVisualPlacement[];
  keyIdeas: AiEngineeringKeyIdea[];
};

export type PreparedAiEngineeringModule = {
  sourceVersion: string;
  courseSlug: string;
  moduleSlug: string;
  configuration: AiEngineeringModuleManifest["module"];
  assets: AiEngineeringAssets;
  content: AiEngineeringContent;
  presentation: AiEngineeringPresentationConfig;
};

export type AiEngineeringPresentationSlide = {
  id: string;
  sourcePath: string;
  publicPath: string;
  alt: string;
  width: number;
  height: number;
};

export type AiEngineeringPresentationConfig = {
  title: string;
  slides: AiEngineeringPresentationSlide[];
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
  curriculum: AiEngineeringCourseModulePlan[];
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
