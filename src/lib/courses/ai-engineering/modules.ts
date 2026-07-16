import preparedModulesJson from "@/generated/ai-engineering/modules.json";
import type {
  AiEngineeringModule,
  PreparedAiEngineeringModule,
  ProgressUnit,
} from "@/lib/courses/types";

const preparedModules = preparedModulesJson as PreparedAiEngineeringModule[];

export const aiEngineeringModules: AiEngineeringModule[] = preparedModules.map((prepared) => {
  const configuration = prepared.configuration;
  const learningPath: ProgressUnit[] = configuration.progressUnits.map((unit, index) => ({
    id: unit.id,
    order: index + 1,
    sourceKey: unit.id,
    sectionId: unit.sectionId,
    label: unit.label,
    kind: unit.kind,
  }));

  return {
    summary: {
      slug: configuration.publicSlug,
      order: configuration.number,
      title: configuration.title,
      status: configuration.editorialStatus,
      estimatedStudyMinutes: configuration.estimatedStudyMinutes,
      progressUnits: learningPath,
    },
    editorialSlug: configuration.editorialSlug,
    editorialStatus: configuration.editorialStatus,
    publish: configuration.publish,
    level: configuration.level,
    estimatedStudyMinutes: configuration.estimatedStudyMinutes,
    learningPath,
    assets: prepared.assets,
    content: prepared.content,
    configuration,
    presentation: prepared.presentation,
    visuals: configuration.visuals ?? [],
    keyIdeas: configuration.keyIdeas ?? [],
  };
});

export function getAiEngineeringModule(moduleSlug: string) {
  return aiEngineeringModules.find((module) => module.summary.slug === moduleSlug);
}
