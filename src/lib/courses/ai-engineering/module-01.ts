import preparedModuleJson from "@/generated/ai-engineering/module-01.json";
import type {
  AiEngineeringModule,
  PreparedAiEngineeringModule,
  ProgressUnit,
} from "@/lib/courses/types";
import {
  AI_ENGINEERING_COURSE_SLUG,
  aiEngineeringManifest,
} from "./manifest";

const preparedModule = preparedModuleJson as PreparedAiEngineeringModule;

if (
  preparedModule.sourceVersion !== aiEngineeringManifest.version ||
  preparedModule.courseSlug !== AI_ENGINEERING_COURSE_SLUG ||
  preparedModule.moduleSlug !== aiEngineeringManifest.module.id
) {
  throw new Error("Prepared AI Engineering content is out of sync with module-manifest.json.");
}

const learningPath: ProgressUnit[] = aiEngineeringManifest.module.learningPath.map((sourceKey, index) => ({
  id: sourceKey,
  order: index + 1,
  sourceKey,
}));

export const aiEngineeringModuleOne: AiEngineeringModule = {
  summary: {
    slug: aiEngineeringManifest.module.id,
    order: aiEngineeringManifest.module.number,
    title: aiEngineeringManifest.module.title,
    status: aiEngineeringManifest.module.status,
    estimatedStudyMinutes: aiEngineeringManifest.module.estimatedStudyMinutes,
    progressUnits: learningPath,
  },
  status: aiEngineeringManifest.module.status,
  estimatedStudyMinutes: aiEngineeringManifest.module.estimatedStudyMinutes,
  learningPath,
  assets: preparedModule.assets,
  content: preparedModule.content,
};
