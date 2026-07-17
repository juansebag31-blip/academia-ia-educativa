import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";
import {
  assertNoTodoPlaceholders,
  parseAiEngineeringCourseManifest,
  parseAiEngineeringModuleManifest,
  type AiEngineeringCourseManifest,
  type AiEngineeringModuleManifest,
} from "./module-contract";

const rendererAnchors = new Set([
  "orientacion",
  "contenido",
  "infografia",
  "audio",
  "casos",
  "presentacion",
  "actividad",
  "autoevaluacion",
  "fuentes",
]);

export type AiEngineeringPackageValidation = {
  manifest: AiEngineeringModuleManifest;
  packageRoot: string;
  sectionIds: string[];
  caseCount: number;
  questionCount: number;
  slideCount: number;
  sourceFiles: string[];
};

export async function validateAiEngineeringCoursePackage(
  courseManifestValue: unknown,
  sourceRoot: string,
) {
  const courseManifest = parseAiEngineeringCourseManifest(courseManifestValue);
  const modules: AiEngineeringPackageValidation[] = [];

  for (const plan of courseManifest.modules) {
    if (!plan.manifestPath) continue;
    const manifestPath = resolveInside(sourceRoot, plan.manifestPath);
    const manifestValue = JSON.parse(await readFile(manifestPath, "utf8"));
    const validation = await validateAiEngineeringModulePackage(manifestValue, path.dirname(manifestPath));
    const manifest = validation.manifest;
    if (manifest.courseSlug !== courseManifest.courseSlug) throw new Error(`Module ${plan.number} uses a different courseSlug.`);
    if (manifest.module.number !== plan.number) throw new Error(`Module ${plan.number} number differs from the course manifest.`);
    if (manifest.module.title !== plan.title) throw new Error(`Module ${plan.number} title differs from the course manifest.`);
    if (manifest.module.editorialSlug !== plan.editorialSlug) throw new Error(`Module ${plan.number} editorialSlug differs from the course manifest.`);
    if (manifest.module.publicSlug !== plan.publicSlug) throw new Error(`Module ${plan.number} publicSlug differs from the course manifest.`);
    if (manifest.module.editorialStatus !== plan.editorialStatus || manifest.module.publish !== plan.publish) {
      throw new Error(`Module ${plan.number} publication state differs from the course manifest.`);
    }
    modules.push(validation);
  }

  return { courseManifest, modules };
}

export async function validateAiEngineeringModulePackage(
  manifestValue: unknown,
  sourceRoot: string,
): Promise<AiEngineeringPackageValidation> {
  const manifest = parseAiEngineeringModuleManifest(manifestValue);
  const moduleConfig = manifest.module;
  const sourceFiles = collectSourceFiles(manifest);

  for (const sourcePath of sourceFiles) await requireFile(sourceRoot, sourcePath);
  requireExtension(moduleConfig.content.foundationalHtml, [".html"], "foundational HTML");
  if (moduleConfig.content.visualAudioHtml) requireExtension(moduleConfig.content.visualAudioHtml, [".html"], "visual-audio HTML");
  requireExtension(moduleConfig.assets.infographic.sourcePath, [".png", ".webp", ".jpg", ".jpeg"], "infographic");
  requireExtension(moduleConfig.assets.audio.mp3SourcePath, [".mp3"], "web audio");
  if (moduleConfig.assets.audio.m4aSourcePath) requireExtension(moduleConfig.assets.audio.m4aSourcePath, [".m4a"], "source audio");
  requireExtension(moduleConfig.assets.presentation.sourcePath, [".pptx"], "presentation");
  moduleConfig.assets.cases.forEach((item) => requireExtension(item.sourcePath, [".html"], `case ${item.id}`));
  moduleConfig.visuals?.forEach((visual) => {
    if ("sourcePath" in visual) {
      requireExtension(visual.sourcePath, [".png", ".webp", ".jpg", ".jpeg"], `visual ${visual.visualId}`);
    }
  });

  const foundationalSource = await readSafeText(sourceRoot, moduleConfig.content.foundationalHtml);
  assertNoTodoPlaceholders(foundationalSource, "foundational HTML");
  const document = new JSDOM(foundationalSource).window.document;
  const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
  const sectionIds = sections.map((section) => section.id);
  if (sectionIds.length === 0) throw new Error("AI Engineering foundational HTML has no main section[id] elements.");
  if (new Set(sectionIds).size !== sectionIds.length) throw new Error("AI Engineering foundational HTML contains duplicate section ids.");

  const objectives = requireSection(document, moduleConfig.content.objectives.sectionId, "objectives");
  requireNonEmptyMatches(objectives, moduleConfig.content.objectives.selector, "objectives");
  const activity = requireSection(document, moduleConfig.content.activity.sectionId, "activity");
  if (!Array.from(activity.querySelectorAll("p, li")).some((item) => item.textContent?.trim())) {
    throw new Error("AI Engineering activity section has no non-empty prompt.");
  }
  const assessment = requireSection(document, moduleConfig.content.selfAssessment.sectionId, "self-assessment");
  const questions = requireNonEmptyMatches(
    assessment,
    moduleConfig.content.selfAssessment.questionSelector,
    "self-assessment questions",
  );
  if (questions.length !== moduleConfig.content.selfAssessment.questionCount) {
    throw new Error(`AI Engineering self-assessment declares ${moduleConfig.content.selfAssessment.questionCount} questions but found ${questions.length}.`);
  }
  const sources = requireSection(document, moduleConfig.content.sources.sectionId, "sources");
  const sourceItems = requireNonEmptyMatches(sources, moduleConfig.content.sources.itemSelector, "sources");
  if (!sourceItems.some((item) => item.querySelector("a[href]"))) {
    throw new Error("AI Engineering sources must include at least one original link.");
  }

  const availableAnchors = new Set([...rendererAnchors, ...sectionIds]);
  for (const unit of moduleConfig.progressUnits) {
    if (!availableAnchors.has(unit.sectionId)) {
      throw new Error(`AI Engineering progress unit ${unit.id} points to missing anchor ${unit.sectionId}.`);
    }
  }
  for (const visual of moduleConfig.visuals ?? []) {
    if (!sectionIds.includes(visual.afterSection)) {
      throw new Error(`AI Engineering visual ${visual.visualId} points to missing section ${visual.afterSection}.`);
    }
  }
  for (const idea of moduleConfig.keyIdeas ?? []) {
    if (!sectionIds.includes(idea.afterSection)) {
      throw new Error(`AI Engineering key idea ${idea.ideaId} points to missing section ${idea.afterSection}.`);
    }
  }

  const textSources = [
    moduleConfig.content.visualAudioHtml,
    moduleConfig.assets.audio.transcriptSourcePath,
    ...moduleConfig.assets.cases.map((item) => item.sourcePath),
  ].filter((value): value is string => Boolean(value));
  for (const sourcePath of textSources) {
    const source = await readSafeText(sourceRoot, sourcePath);
    if (!new JSDOM(source).window.document.body.textContent?.trim()) {
      throw new Error(`AI Engineering text source is empty: ${sourcePath}`);
    }
    assertNoTodoPlaceholders(source, sourcePath);
  }

  await validateSlides(sourceRoot, manifest);
  return {
    manifest,
    packageRoot: path.resolve(sourceRoot),
    sectionIds,
    caseCount: moduleConfig.assets.cases.length,
    questionCount: questions.length,
    slideCount: moduleConfig.assets.presentation.slideCount,
    sourceFiles,
  };
}

export function canPublishAiEngineeringModule(manifest: AiEngineeringModuleManifest) {
  return manifest.module.editorialStatus === "approved" && manifest.module.publish === true;
}

export function renderSlideFileName(pattern: string, number: number) {
  return pattern.replace(/\{number(?::(\d+))?\}/, (_, width: string | undefined) =>
    width ? String(number).padStart(Number(width), "0") : String(number),
  );
}

function collectSourceFiles(manifest: AiEngineeringModuleManifest) {
  const moduleConfig = manifest.module;
  const slideFiles = Array.from({ length: moduleConfig.assets.presentation.slideCount }, (_, index) =>
    path.posix.join(
      moduleConfig.assets.presentation.slidesDirectory.replaceAll("\\", "/"),
      renderSlideFileName(moduleConfig.assets.presentation.slideFilePattern, index + 1),
    ),
  );
  return [
    moduleConfig.content.foundationalHtml,
    moduleConfig.content.visualAudioHtml,
    moduleConfig.assets.infographic.sourcePath,
    moduleConfig.assets.audio.mp3SourcePath,
    moduleConfig.assets.audio.m4aSourcePath,
    moduleConfig.assets.audio.transcriptSourcePath,
    moduleConfig.assets.presentation.sourcePath,
    ...moduleConfig.assets.cases.map((item) => item.sourcePath),
    ...(moduleConfig.visuals ?? []).flatMap((visual) =>
      "sourcePath" in visual ? [visual.sourcePath] : [],
    ),
    ...slideFiles,
  ].filter((value): value is string => Boolean(value));
}

async function validateSlides(sourceRoot: string, manifest: AiEngineeringModuleManifest) {
  const presentation = manifest.module.assets.presentation;
  const directory = resolveInside(sourceRoot, presentation.slidesDirectory);
  const entries = await readdir(directory, { withFileTypes: true });
  const extension = path.extname(renderSlideFileName(presentation.slideFilePattern, 1)).toLowerCase();
  const slideFiles = entries.filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === extension);
  if (slideFiles.length !== presentation.slideCount) {
    throw new Error(`AI Engineering presentation declares ${presentation.slideCount} slides but found ${slideFiles.length}.`);
  }
}

function requireSection(document: Document, id: string, label: string) {
  const section = document.querySelector<HTMLElement>(`main section[id="${id}"]`);
  if (!section) throw new Error(`AI Engineering ${label} section ${id} does not exist.`);
  return section;
}

function requireNonEmptyMatches(root: ParentNode, selector: string, label: string) {
  let items: Element[];
  try {
    items = Array.from(root.querySelectorAll(selector));
  } catch {
    throw new Error(`AI Engineering ${label} selector is invalid: ${selector}.`);
  }
  if (items.length === 0 || items.some((item) => !item.textContent?.trim())) {
    throw new Error(`AI Engineering ${label} must contain non-empty items.`);
  }
  return items;
}

async function requireFile(root: string, sourcePath: string) {
  const absolutePath = resolveInside(root, sourcePath);
  const sourceStat = await stat(absolutePath).catch(() => null);
  if (!sourceStat?.isFile()) throw new Error(`Required AI Engineering source is missing: ${sourcePath}`);
}

async function readSafeText(root: string, sourcePath: string) {
  return readFile(resolveInside(root, sourcePath), "utf8");
}

function resolveInside(root: string, sourcePath: string) {
  const absoluteRoot = path.resolve(root);
  const absolutePath = path.resolve(absoluteRoot, sourcePath);
  const relative = path.relative(absoluteRoot, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`AI Engineering source path escapes the package: ${sourcePath}`);
  }
  return absolutePath;
}

function requireExtension(sourcePath: string, extensions: string[], label: string) {
  if (!extensions.includes(path.extname(sourcePath).toLowerCase())) {
    throw new Error(`AI Engineering ${label} has an invalid file extension: ${sourcePath}`);
  }
}

export function getPublishedCourseModules(courseManifest: AiEngineeringCourseManifest) {
  return courseManifest.modules.filter(
    (module) => module.editorialStatus === "approved" && module.publish && module.manifestPath,
  );
}
