import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { aiEngineeringCourseManifest } from "../src/lib/courses/ai-engineering/manifest";
import type {
  AiEngineeringModuleManifest,
  AiEngineeringVisualPlacement,
} from "../src/lib/courses/ai-engineering/module-contract";
import {
  canPublishAiEngineeringModule,
  renderSlideFileName,
  validateAiEngineeringCoursePackage,
  validateAiEngineeringModulePackage,
} from "../src/lib/courses/ai-engineering/module-validator";
import type {
  AiEngineeringAssets,
  AiEngineeringPreparedHtml,
  AiEngineeringPresentationConfig,
  PreparedAiEngineeringModule,
} from "../src/lib/courses/types";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(scriptDirectory, "..");
export const sourceRoot = path.join(projectRoot, "course-content", "ai-engineering");
export const generatedModulesPath = path.join(
  projectRoot,
  "src",
  "generated",
  "ai-engineering",
  "modules.json",
);
export const publicCourseRoot = path.join(projectRoot, "public", "ai-engineering-assets");

export async function prepareAiEngineeringContent(courseManifestValue: unknown = aiEngineeringCourseManifest) {
  const validation = await validateAiEngineeringCoursePackage(courseManifestValue, sourceRoot);
  const preparedModules: PreparedAiEngineeringModule[] = [];
  await rm(publicCourseRoot, { recursive: true, force: true });
  await mkdir(publicCourseRoot, { recursive: true });

  for (const moduleValidation of validation.modules) {
    if (!canPublishAiEngineeringModule(moduleValidation.manifest)) continue;
    preparedModules.push(
      await prepareAiEngineeringModulePackage(
        moduleValidation.manifest,
        moduleValidation.packageRoot,
        publicCourseRoot,
      ),
    );
  }

  await mkdir(path.dirname(generatedModulesPath), { recursive: true });
  await writeFile(generatedModulesPath, `${JSON.stringify(preparedModules, null, 2)}\n`, "utf8");
  const digest = createHash("sha256").update(JSON.stringify(preparedModules)).digest("hex");

  return {
    generatedModulesPath,
    publicCourseRoot,
    preparedModules,
    digest,
  };
}

export async function prepareAiEngineeringModulePackage(
  manifestValue: unknown,
  packageRoot: string,
  publicRoot: string,
) {
  const validation = await validateAiEngineeringModulePackage(manifestValue, packageRoot);
  const manifest = validation.manifest;
  const publicModuleRoot = path.join(publicRoot, manifest.module.publicSlug);
  const assets = buildAssets(manifest);
  const presentation = buildPresentation(manifest);
  const visuals = buildVisuals(manifest);

  await copyPublicAssets(packageRoot, publicModuleRoot, assets, presentation, visuals);
  const assetUrlsByFilename = new Map(
    [assets.infographic, assets.audioMp3, assets.presentation].map((asset) => [
      path.basename(asset.sourcePath),
      asset.publicPath,
    ]),
  );

  const prepared: PreparedAiEngineeringModule = {
    sourceVersion: manifest.sourceVersion,
    courseSlug: manifest.courseSlug,
    moduleSlug: manifest.module.publicSlug,
    configuration: { ...manifest.module, visuals },
    assets,
    content: {
      foundational: await prepareHtmlDocument(packageRoot, assets.contentHtml.sourcePath, assetUrlsByFilename),
      visualAudio: assets.visualAudioHtml
        ? await prepareHtmlDocument(packageRoot, assets.visualAudioHtml.sourcePath, assetUrlsByFilename)
        : undefined,
      audioScript: await readSourceText(packageRoot, assets.audioScript.sourcePath),
      cases: await Promise.all(
        assets.cases.map(async (caseAsset) => ({
          id: caseAsset.id,
          ...(await prepareHtmlDocument(packageRoot, caseAsset.sourcePath, assetUrlsByFilename)),
        })),
      ),
    },
    presentation,
  };

  return prepared;
}

function buildVisuals(manifest: AiEngineeringModuleManifest): AiEngineeringVisualPlacement[] {
  const publicUrlRoot = `/ai-engineering-assets/${manifest.module.publicSlug}/visuals`;
  return (manifest.module.visuals ?? []).map((visual) =>
    "sourcePath" in visual
      ? {
          ...visual,
          publicPath: `${publicUrlRoot}/${path.basename(visual.sourcePath)}`,
        }
      : visual,
  );
}

function buildAssets(manifest: AiEngineeringModuleManifest): AiEngineeringAssets {
  const moduleConfig = manifest.module;
  const publicUrlRoot = `/ai-engineering-assets/${moduleConfig.publicSlug}`;
  return {
    contentHtml: { sourcePath: moduleConfig.content.foundationalHtml },
    visualAudioHtml: moduleConfig.content.visualAudioHtml
      ? { sourcePath: moduleConfig.content.visualAudioHtml }
      : undefined,
    infographic: {
      sourcePath: moduleConfig.assets.infographic.sourcePath,
      publicPath: `${publicUrlRoot}/${path.basename(moduleConfig.assets.infographic.sourcePath)}`,
      mediaType: mediaTypeFor(moduleConfig.assets.infographic.sourcePath),
    },
    audioMp3: {
      sourcePath: moduleConfig.assets.audio.mp3SourcePath,
      publicPath: `${publicUrlRoot}/${path.basename(moduleConfig.assets.audio.mp3SourcePath)}`,
      mediaType: "audio/mpeg",
    },
    audioM4a: moduleConfig.assets.audio.m4aSourcePath
      ? { sourcePath: moduleConfig.assets.audio.m4aSourcePath }
      : undefined,
    audioScript: { sourcePath: moduleConfig.assets.audio.transcriptSourcePath },
    presentation: {
      sourcePath: moduleConfig.assets.presentation.sourcePath,
      publicPath: `${publicUrlRoot}/${path.basename(moduleConfig.assets.presentation.sourcePath)}`,
      mediaType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
    cases: moduleConfig.assets.cases.map((item) => ({ ...item })),
  };
}

function buildPresentation(manifest: AiEngineeringModuleManifest): AiEngineeringPresentationConfig {
  const moduleConfig = manifest.module;
  const config = moduleConfig.assets.presentation;
  const publicUrlRoot = `/ai-engineering-assets/${moduleConfig.publicSlug}/slides`;
  return {
    title: config.title,
    slides: Array.from({ length: config.slideCount }, (_, index) => {
      const current = index + 1;
      const fileName = renderSlideFileName(config.slideFilePattern, current);
      return {
        id: `slide-${String(current).padStart(2, "0")}`,
        sourcePath: path.posix.join(config.slidesDirectory.replaceAll("\\", "/"), fileName),
        publicPath: `${publicUrlRoot}/${fileName}`,
        alt: config.slideAltTemplate
          .replaceAll("{current}", String(current))
          .replaceAll("{total}", String(config.slideCount)),
        width: config.slideWidth,
        height: config.slideHeight,
      };
    }),
  };
}

async function copyPublicAssets(
  packageRoot: string,
  publicModuleRoot: string,
  assets: AiEngineeringAssets,
  presentation: AiEngineeringPresentationConfig,
  visuals: AiEngineeringVisualPlacement[],
) {
  assertInside(publicCourseRootFor(publicModuleRoot), publicModuleRoot);
  await rm(publicModuleRoot, { recursive: true, force: true });
  await mkdir(publicModuleRoot, { recursive: true });

  for (const asset of [assets.infographic, assets.audioMp3, assets.presentation]) {
    const destination = path.join(publicCourseRootFor(publicModuleRoot), asset.publicPath.replace(/^\/ai-engineering-assets\//, ""));
    assertInside(publicModuleRoot, destination);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(resolveSourcePath(packageRoot, asset.sourcePath), destination);
  }

  for (const slide of presentation.slides) {
    const destination = path.join(publicCourseRootFor(publicModuleRoot), slide.publicPath.replace(/^\/ai-engineering-assets\//, ""));
    assertInside(publicModuleRoot, destination);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(resolveSourcePath(packageRoot, slide.sourcePath), destination);
  }

  for (const visual of visuals) {
    if (!("sourcePath" in visual) || !visual.publicPath) continue;
    const destination = path.join(
      publicCourseRootFor(publicModuleRoot),
      visual.publicPath.replace(/^\/ai-engineering-assets\//, ""),
    );
    assertInside(publicModuleRoot, destination);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(resolveSourcePath(packageRoot, visual.sourcePath), destination);
  }
}

function publicCourseRootFor(publicModuleRoot: string) {
  return path.dirname(publicModuleRoot);
}

async function prepareHtmlDocument(
  packageRoot: string,
  sourcePath: string,
  assetUrlsByFilename: Map<string, string>,
): Promise<AiEngineeringPreparedHtml> {
  const source = await readSourceText(packageRoot, sourcePath);
  const dom = new JSDOM(source);
  const document = dom.window.document;

  document.querySelectorAll("script, style, link[rel='stylesheet'], noscript").forEach((node) => node.remove());
  document.querySelectorAll("*").forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name === "style" || attribute.name.toLowerCase().startsWith("on")) {
        element.removeAttribute(attribute.name);
      }
    }
    for (const attributeName of ["href", "src"] as const) {
      const value = element.getAttribute(attributeName);
      if (!value) continue;
      const publicPath = assetUrlsByFilename.get(path.basename(value));
      if (publicPath) element.setAttribute(attributeName, publicPath);
    }
    if (element.getAttribute("target") === "_blank") {
      element.setAttribute("rel", "noopener noreferrer");
    }
  });

  const html = Array.from(document.body.children)
    .map((element) => element.outerHTML.trim())
    .filter(Boolean)
    .join("\n");
  const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]")).map((section) => ({
    id: section.id,
    title: section.querySelector("h2, h3")?.textContent?.trim() ?? section.id,
    html: section.innerHTML.trim(),
  }));

  return {
    title: document.title.trim(),
    html,
    introHtml: document.querySelector("body > header")?.innerHTML.trim() ?? "",
    footerHtml: document.querySelector("main > .footer")?.innerHTML.trim() ?? "",
    sections,
  };
}

async function readSourceText(packageRoot: string, sourcePath: string) {
  return readFile(resolveSourcePath(packageRoot, sourcePath), "utf8");
}

function resolveSourcePath(packageRoot: string, sourcePath: string) {
  const absolutePath = path.resolve(packageRoot, sourcePath);
  assertInside(packageRoot, absolutePath);
  return absolutePath;
}

function assertInside(parent: string, target: string) {
  const relative = path.relative(path.resolve(parent), path.resolve(target));
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path escapes the expected directory: ${target}`);
  }
}

function mediaTypeFor(sourcePath: string) {
  const extension = path.extname(sourcePath).toLowerCase();
  if (extension === ".webp") return "image/webp";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  return "image/png";
}

const isMainModule = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isMainModule) {
  prepareAiEngineeringContent()
    .then(({ generatedModulesPath: outputPath, publicCourseRoot: publicPath, preparedModules, digest }) => {
      console.log(`AI Engineering modules prepared: ${preparedModules.length}`);
      console.log(`AI Engineering data generated: ${path.relative(projectRoot, outputPath)}`);
      console.log(`AI Engineering media copied: ${path.relative(projectRoot, publicPath)}`);
      console.log(`AI Engineering digest: ${digest}`);
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
