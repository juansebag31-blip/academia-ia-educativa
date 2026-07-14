import manifestJson from "../../../../course-content/ai-engineering/module-manifest.json";

export const AI_ENGINEERING_COURSE_SLUG = "ai-engineering-aplicado";

export type AiEngineeringManifest = {
  course: string;
  version: string;
  module: {
    id: string;
    number: number;
    title: string;
    status: string;
    estimatedStudyMinutes: number;
    learningPath: string[];
    assets: {
      contentHtml: string;
      visualAudioHtml: string;
      infographic: string;
      audioMp3: string;
      audioM4a: string;
      audioScript: string;
      presentation: string;
      cases: string[];
    };
  };
};

export function parseAiEngineeringManifest(value: unknown): AiEngineeringManifest {
  if (!isRecord(value)) throw new Error("AI Engineering manifest must be an object.");
  requireString(value.course, "course");
  requireString(value.version, "version");
  if (!isRecord(value.module)) throw new Error("AI Engineering manifest.module must be an object.");

  const manifestModule = value.module;
  requireString(manifestModule.id, "module.id");
  requirePositiveInteger(manifestModule.number, "module.number");
  requireString(manifestModule.title, "module.title");
  requireString(manifestModule.status, "module.status");
  requirePositiveInteger(manifestModule.estimatedStudyMinutes, "module.estimatedStudyMinutes");
  requireStringArray(manifestModule.learningPath, "module.learningPath");

  if (!isRecord(manifestModule.assets)) throw new Error("AI Engineering manifest.module.assets must be an object.");
  const assets = manifestModule.assets;
  for (const key of [
    "contentHtml",
    "visualAudioHtml",
    "infographic",
    "audioMp3",
    "audioM4a",
    "audioScript",
    "presentation",
  ] as const) {
    requireString(assets[key], `module.assets.${key}`);
  }
  requireStringArray(assets.cases, "module.assets.cases");

  if (new Set(manifestModule.learningPath).size !== manifestModule.learningPath.length) {
    throw new Error("AI Engineering manifest.module.learningPath contains duplicates.");
  }

  return value as AiEngineeringManifest;
}

export const aiEngineeringManifest = parseAiEngineeringManifest(manifestJson);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`AI Engineering manifest.${path} must be a non-empty string.`);
  }
}

function requirePositiveInteger(value: unknown, path: string): asserts value is number {
  if (!Number.isInteger(value) || Number(value) <= 0) {
    throw new Error(`AI Engineering manifest.${path} must be a positive integer.`);
  }
}

function requireStringArray(value: unknown, path: string): asserts value is string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`AI Engineering manifest.${path} must be a non-empty string array.`);
  }
  value.forEach((item, index) => requireString(item, `${path}[${index}]`));
}
