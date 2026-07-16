export const AI_ENGINEERING_EDITORIAL_STATUSES = ["draft", "reviewed", "approved"] as const;
export type AiEngineeringEditorialStatus = (typeof AI_ENGINEERING_EDITORIAL_STATUSES)[number];

export const AI_ENGINEERING_PROGRESS_KINDS = [
  "orientation",
  "foundational-content",
  "infographic",
  "audio",
  "cases",
  "presentation",
  "activity",
  "self-assessment",
] as const;
export type AiEngineeringProgressKind = (typeof AI_ENGINEERING_PROGRESS_KINDS)[number];

export const AI_ENGINEERING_VISUAL_COMPONENT_TYPES = [
  "model-vs-system",
  "workflow-vs-agent",
  "system-components-map",
  "minimum-complexity-ladder",
  "imaging-study-flow",
] as const;
export type AiEngineeringVisualComponentType =
  (typeof AI_ENGINEERING_VISUAL_COMPONENT_TYPES)[number];

export type AiEngineeringCourseModulePlan = {
  number: number;
  title: string;
  editorialSlug: string;
  publicSlug?: string;
  editorialStatus: AiEngineeringEditorialStatus;
  publish: boolean;
  manifestPath?: string;
};

export type AiEngineeringCourseManifest = {
  schemaVersion: number;
  courseSlug: string;
  title: string;
  modules: AiEngineeringCourseModulePlan[];
};

export type AiEngineeringProgressUnitConfig = {
  id: string;
  kind: AiEngineeringProgressKind;
  sectionId: string;
  label: string;
};

export type AiEngineeringVisualPlacement = {
  afterSection: string;
  visualId: string;
  title: string;
  description: string;
  componentType: AiEngineeringVisualComponentType;
};

export type AiEngineeringKeyIdea = {
  afterSection: string;
  ideaId: string;
  text: string;
};

export type AiEngineeringModuleManifest = {
  schemaVersion: number;
  sourceVersion: string;
  courseSlug: string;
  module: {
    editorialSlug: string;
    publicSlug: string;
    number: number;
    title: string;
    editorialStatus: AiEngineeringEditorialStatus;
    publish: boolean;
    level: string;
    estimatedStudyMinutes: number;
    content: {
      foundationalHtml: string;
      visualAudioHtml?: string;
      objectives: { sectionId: string; selector: string };
      activity: { sectionId: string };
      selfAssessment: {
        sectionId: string;
        questionSelector: string;
        questionCount: number;
      };
      sources: { sectionId: string; itemSelector: string };
    };
    assets: {
      infographic: { sourcePath: string; title: string; alt: string };
      audio: {
        mp3SourcePath: string;
        m4aSourcePath?: string;
        transcriptSourcePath: string;
        title: string;
      };
      cases: Array<{ id: string; sourcePath: string }>;
      presentation: {
        sourcePath: string;
        title: string;
        slidesDirectory: string;
        slideCount: number;
        slideFilePattern: string;
        slideWidth: number;
        slideHeight: number;
        slideAltTemplate: string;
      };
    };
    sections: {
      casesTitle: string;
      presentationTitle: string;
    };
    interactions: {
      activity: { unitId: string; responseLabel: string; placeholder: string };
      selfAssessment: { unitId: string };
    };
    progressUnits: AiEngineeringProgressUnitConfig[];
    visuals?: AiEngineeringVisualPlacement[];
    keyIdeas?: AiEngineeringKeyIdea[];
  };
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const identifierPattern = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
const todoPattern = /\bTODO_[A-Z0-9_]+\b/;

export function parseAiEngineeringCourseManifest(value: unknown): AiEngineeringCourseManifest {
  assertNoTodoPlaceholders(value, "course manifest");
  const root = requireRecord(value, "course manifest");
  requirePositiveInteger(root.schemaVersion, "schemaVersion");
  requireSlug(root.courseSlug, "courseSlug");
  requireString(root.title, "title");
  const modules = requireArray(root.modules, "modules");
  if (modules.length === 0) throw new Error("AI Engineering course manifest.modules must not be empty.");

  modules.forEach((entry, index) => {
    const modulePlan = requireRecord(entry, `modules[${index}]`);
    requirePositiveInteger(modulePlan.number, `modules[${index}].number`);
    requireString(modulePlan.title, `modules[${index}].title`);
    requireSlug(modulePlan.editorialSlug, `modules[${index}].editorialSlug`);
    requireEditorialStatus(modulePlan.editorialStatus, `modules[${index}].editorialStatus`);
    requireBoolean(modulePlan.publish, `modules[${index}].publish`);
    requireOptionalSlug(modulePlan.publicSlug, `modules[${index}].publicSlug`);
    requireOptionalString(modulePlan.manifestPath, `modules[${index}].manifestPath`);
    if (modulePlan.publish && modulePlan.editorialStatus !== "approved") {
      throw new Error(`AI Engineering course manifest.modules[${index}] cannot publish unless editorialStatus is approved.`);
    }
    if (modulePlan.publish && (!modulePlan.publicSlug || !modulePlan.manifestPath)) {
      throw new Error(`AI Engineering course manifest.modules[${index}] requires publicSlug and manifestPath when publish is true.`);
    }
  });

  assertUnique(modules.map((entry) => requireRecord(entry, "module").number), "module numbers");
  assertUnique(modules.map((entry) => requireRecord(entry, "module").editorialSlug), "editorial slugs");
  assertUnique(
    modules
      .map((entry) => requireRecord(entry, "module").publicSlug)
      .filter((value): value is string => typeof value === "string"),
    "public slugs",
  );
  return value as AiEngineeringCourseManifest;
}

export function parseAiEngineeringModuleManifest(value: unknown): AiEngineeringModuleManifest {
  assertNoTodoPlaceholders(value, "module manifest");
  const root = requireRecord(value, "module manifest");
  requirePositiveInteger(root.schemaVersion, "schemaVersion");
  requireString(root.sourceVersion, "sourceVersion");
  requireSlug(root.courseSlug, "courseSlug");
  const moduleConfig = requireRecord(root.module, "module");

  requireSlug(moduleConfig.editorialSlug, "module.editorialSlug");
  requireSlug(moduleConfig.publicSlug, "module.publicSlug");
  requirePositiveInteger(moduleConfig.number, "module.number");
  requireString(moduleConfig.title, "module.title");
  requireEditorialStatus(moduleConfig.editorialStatus, "module.editorialStatus");
  requireBoolean(moduleConfig.publish, "module.publish");
  requireString(moduleConfig.level, "module.level");
  requirePositiveInteger(moduleConfig.estimatedStudyMinutes, "module.estimatedStudyMinutes");
  if (moduleConfig.publish && moduleConfig.editorialStatus !== "approved") {
    throw new Error("AI Engineering module cannot publish unless editorialStatus is approved.");
  }

  const content = requireRecord(moduleConfig.content, "module.content");
  requireString(content.foundationalHtml, "module.content.foundationalHtml");
  requireOptionalString(content.visualAudioHtml, "module.content.visualAudioHtml");
  requireSectionSelector(content.objectives, "module.content.objectives", "selector");
  requireSectionSelector(content.activity, "module.content.activity");
  const selfAssessment = requireSectionSelector(
    content.selfAssessment,
    "module.content.selfAssessment",
    "questionSelector",
  );
  requirePositiveInteger(selfAssessment.questionCount, "module.content.selfAssessment.questionCount");
  requireSectionSelector(content.sources, "module.content.sources", "itemSelector");

  const assets = requireRecord(moduleConfig.assets, "module.assets");
  const infographic = requireRecord(assets.infographic, "module.assets.infographic");
  requireString(infographic.sourcePath, "module.assets.infographic.sourcePath");
  requireString(infographic.title, "module.assets.infographic.title");
  requireString(infographic.alt, "module.assets.infographic.alt");

  const audio = requireRecord(assets.audio, "module.assets.audio");
  requireString(audio.mp3SourcePath, "module.assets.audio.mp3SourcePath");
  requireOptionalString(audio.m4aSourcePath, "module.assets.audio.m4aSourcePath");
  requireString(audio.transcriptSourcePath, "module.assets.audio.transcriptSourcePath");
  requireString(audio.title, "module.assets.audio.title");

  const cases = requireArray(assets.cases, "module.assets.cases");
  if (cases.length === 0) throw new Error("AI Engineering module requires at least one real case.");
  cases.forEach((entry, index) => {
    const item = requireRecord(entry, `module.assets.cases[${index}]`);
    requireSlug(item.id, `module.assets.cases[${index}].id`);
    requireString(item.sourcePath, `module.assets.cases[${index}].sourcePath`);
  });
  assertUnique(cases.map((entry) => requireRecord(entry, "case").id), "case ids");

  const presentation = requireRecord(assets.presentation, "module.assets.presentation");
  for (const key of ["sourcePath", "title", "slidesDirectory", "slideFilePattern", "slideAltTemplate"] as const) {
    requireString(presentation[key], `module.assets.presentation.${key}`);
  }
  requirePositiveInteger(presentation.slideCount, "module.assets.presentation.slideCount");
  requirePositiveInteger(presentation.slideWidth, "module.assets.presentation.slideWidth");
  requirePositiveInteger(presentation.slideHeight, "module.assets.presentation.slideHeight");
  if (!/\{number(?::\d+)?\}/.test(String(presentation.slideFilePattern))) {
    throw new Error("AI Engineering module.assets.presentation.slideFilePattern must contain {number} or {number:N}.");
  }
  if (!String(presentation.slideAltTemplate).includes("{current}") || !String(presentation.slideAltTemplate).includes("{total}")) {
    throw new Error("AI Engineering module.assets.presentation.slideAltTemplate must contain {current} and {total}.");
  }

  const sections = requireRecord(moduleConfig.sections, "module.sections");
  requireString(sections.casesTitle, "module.sections.casesTitle");
  requireString(sections.presentationTitle, "module.sections.presentationTitle");

  const interactions = requireRecord(moduleConfig.interactions, "module.interactions");
  const activity = requireRecord(interactions.activity, "module.interactions.activity");
  requireIdentifier(activity.unitId, "module.interactions.activity.unitId");
  requireString(activity.responseLabel, "module.interactions.activity.responseLabel");
  requireString(activity.placeholder, "module.interactions.activity.placeholder");
  const assessment = requireRecord(interactions.selfAssessment, "module.interactions.selfAssessment");
  requireIdentifier(assessment.unitId, "module.interactions.selfAssessment.unitId");

  const progressUnits = requireArray(moduleConfig.progressUnits, "module.progressUnits");
  if (progressUnits.length === 0) throw new Error("AI Engineering module.progressUnits must not be empty.");
  progressUnits.forEach((entry, index) => {
    const unit = requireRecord(entry, `module.progressUnits[${index}]`);
    requireIdentifier(unit.id, `module.progressUnits[${index}].id`);
    requireEnum(unit.kind, AI_ENGINEERING_PROGRESS_KINDS, `module.progressUnits[${index}].kind`);
    requireSlug(unit.sectionId, `module.progressUnits[${index}].sectionId`);
    requireString(unit.label, `module.progressUnits[${index}].label`);
  });
  assertUnique(progressUnits.map((entry) => requireRecord(entry, "progress unit").id), "progress unit ids");
  assertUnique(progressUnits.map((entry) => requireRecord(entry, "progress unit").sectionId), "progress anchors");
  const progressIds = new Set(progressUnits.map((entry) => String(requireRecord(entry, "progress unit").id)));
  if (!progressIds.has(String(activity.unitId)) || !progressIds.has(String(assessment.unitId))) {
    throw new Error("AI Engineering activity and self-assessment unitId values must exist in progressUnits.");
  }

  validateVisuals(moduleConfig.visuals);
  validateKeyIdeas(moduleConfig.keyIdeas);
  return value as AiEngineeringModuleManifest;
}

export function assertNoTodoPlaceholders(value: unknown, label: string) {
  const matches = collectStrings(value).flatMap((item) => item.match(new RegExp(todoPattern.source, "g")) ?? []);
  if (matches.length > 0) {
    throw new Error(`AI Engineering ${label} contains unresolved placeholders: ${[...new Set(matches)].join(", ")}.`);
  }
}

function validateVisuals(value: unknown) {
  if (value === undefined) return;
  const visuals = requireArray(value, "module.visuals");
  visuals.forEach((entry, index) => {
    const visual = requireRecord(entry, `module.visuals[${index}]`);
    requireSlug(visual.afterSection, `module.visuals[${index}].afterSection`);
    requireSlug(visual.visualId, `module.visuals[${index}].visualId`);
    requireString(visual.title, `module.visuals[${index}].title`);
    requireString(visual.description, `module.visuals[${index}].description`);
    requireEnum(visual.componentType, AI_ENGINEERING_VISUAL_COMPONENT_TYPES, `module.visuals[${index}].componentType`);
  });
  assertUnique(visuals.map((entry) => requireRecord(entry, "visual").visualId), "visual ids");
}

function validateKeyIdeas(value: unknown) {
  if (value === undefined) return;
  const ideas = requireArray(value, "module.keyIdeas");
  ideas.forEach((entry, index) => {
    const idea = requireRecord(entry, `module.keyIdeas[${index}]`);
    requireSlug(idea.afterSection, `module.keyIdeas[${index}].afterSection`);
    requireSlug(idea.ideaId, `module.keyIdeas[${index}].ideaId`);
    requireString(idea.text, `module.keyIdeas[${index}].text`);
  });
  assertUnique(ideas.map((entry) => requireRecord(entry, "idea").ideaId), "key idea ids");
}

function requireSectionSelector(value: unknown, path: string, selectorKey?: string) {
  const section = requireRecord(value, path);
  requireSlug(section.sectionId, `${path}.sectionId`);
  if (selectorKey) requireString(section[selectorKey], `${path}.${selectorKey}`);
  return section;
}

function requireRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`AI Engineering ${path} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requireArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`AI Engineering ${path} must be an array.`);
  return value;
}

function requireString(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`AI Engineering ${path} must be a non-empty string.`);
  }
}

function requireOptionalString(value: unknown, path: string): asserts value is string | undefined {
  if (value !== undefined) requireString(value, path);
}

function requireSlug(value: unknown, path: string): asserts value is string {
  requireString(value, path);
  if (!slugPattern.test(value)) throw new Error(`AI Engineering ${path} must be a valid slug.`);
}

function requireOptionalSlug(value: unknown, path: string): asserts value is string | undefined {
  if (value !== undefined) requireSlug(value, path);
}

function requireIdentifier(value: unknown, path: string): asserts value is string {
  requireString(value, path);
  if (!identifierPattern.test(value)) {
    throw new Error(`AI Engineering ${path} must be a valid identifier.`);
  }
}

function requirePositiveInteger(value: unknown, path: string): asserts value is number {
  if (!Number.isInteger(value) || Number(value) <= 0) {
    throw new Error(`AI Engineering ${path} must be a positive integer.`);
  }
}

function requireBoolean(value: unknown, path: string): asserts value is boolean {
  if (typeof value !== "boolean") throw new Error(`AI Engineering ${path} must be a boolean.`);
}

function requireEditorialStatus(value: unknown, path: string): asserts value is AiEngineeringEditorialStatus {
  requireEnum(value, AI_ENGINEERING_EDITORIAL_STATUSES, path);
}

function requireEnum<const T extends readonly string[]>(value: unknown, allowed: T, path: string): asserts value is T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new Error(`AI Engineering ${path} must be one of: ${allowed.join(", ")}.`);
  }
}

function assertUnique(values: unknown[], label: string) {
  if (new Set(values).size !== values.length) throw new Error(`AI Engineering ${label} contain duplicates.`);
}

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (typeof value === "object" && value !== null) return Object.values(value).flatMap(collectStrings);
  return [];
}
