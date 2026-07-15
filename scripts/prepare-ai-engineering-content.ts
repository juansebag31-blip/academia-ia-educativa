import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import {
  AI_ENGINEERING_COURSE_SLUG,
  aiEngineeringManifest,
} from "../src/lib/courses/ai-engineering/manifest";
import { aiEngineeringModulePresentations } from "../src/lib/courses/ai-engineering/module-presentations";
import type {
  AiEngineeringAssets,
  AiEngineeringPreparedHtml,
  PreparedAiEngineeringModule,
} from "../src/lib/courses/types";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(scriptDirectory, "..");
export const sourceRoot = path.join(projectRoot, "course-content", "ai-engineering");
export const generatedModulePath = path.join(
  projectRoot,
  "src",
  "generated",
  "ai-engineering",
  "module-01.json",
);
export const publicModuleRoot = path.join(
  projectRoot,
  "public",
  "ai-engineering-assets",
  aiEngineeringManifest.module.id,
);

const publicUrlRoot = `/ai-engineering-assets/${aiEngineeringManifest.module.id}`;
export const presentationSlides =
  aiEngineeringModulePresentations[aiEngineeringManifest.module.id]?.slides ?? [];

const publicAssets = {
  infographic: {
    sourcePath: aiEngineeringManifest.module.assets.infographic,
    publicPath: `${publicUrlRoot}/modulo-01-infografia.png`,
    mediaType: "image/png",
  },
  audioMp3: {
    sourcePath: aiEngineeringManifest.module.assets.audioMp3,
    publicPath: `${publicUrlRoot}/modulo-01-audio-explicativo.mp3`,
    mediaType: "audio/mpeg",
  },
  presentation: {
    sourcePath: aiEngineeringManifest.module.assets.presentation,
    publicPath: `${publicUrlRoot}/modulo-01-presentacion.pptx`,
    mediaType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
} as const;

export async function prepareAiEngineeringContent() {
  const assets = buildAssets();
  await verifySourceFiles(assets);
  await copyPublicAssets(assets);

  const assetUrlsByFilename = new Map(
    Object.values(publicAssets).map((asset) => [path.basename(asset.sourcePath), asset.publicPath]),
  );
  const prepared: PreparedAiEngineeringModule = {
    sourceVersion: aiEngineeringManifest.version,
    courseSlug: AI_ENGINEERING_COURSE_SLUG,
    moduleSlug: aiEngineeringManifest.module.id,
    assets,
    content: {
      foundational: await prepareHtmlDocument(assets.contentHtml.sourcePath, assetUrlsByFilename),
      visualAudio: await prepareHtmlDocument(assets.visualAudioHtml.sourcePath, assetUrlsByFilename),
      audioScript: await readSourceText(assets.audioScript.sourcePath),
      cases: await Promise.all(
        assets.cases.map(async (caseAsset) => ({
          id: caseAsset.id,
          ...(await prepareHtmlDocument(caseAsset.sourcePath, assetUrlsByFilename)),
        })),
      ),
    },
  };

  await mkdir(path.dirname(generatedModulePath), { recursive: true });
  await writeFile(generatedModulePath, `${JSON.stringify(prepared, null, 2)}\n`, "utf8");

  return {
    generatedModulePath,
    publicModuleRoot,
    digest: createHash("sha256").update(JSON.stringify(prepared)).digest("hex"),
  };
}

function buildAssets(): AiEngineeringAssets {
  return {
    contentHtml: { sourcePath: aiEngineeringManifest.module.assets.contentHtml },
    visualAudioHtml: { sourcePath: aiEngineeringManifest.module.assets.visualAudioHtml },
    infographic: { ...publicAssets.infographic },
    audioMp3: { ...publicAssets.audioMp3 },
    audioM4a: { sourcePath: aiEngineeringManifest.module.assets.audioM4a },
    audioScript: { sourcePath: aiEngineeringManifest.module.assets.audioScript },
    presentation: { ...publicAssets.presentation },
    cases: aiEngineeringManifest.module.assets.cases.map((sourcePath) => ({
      id: path.basename(sourcePath, path.extname(sourcePath)),
      sourcePath,
    })),
  };
}

async function verifySourceFiles(assets: AiEngineeringAssets) {
  const sourcePaths = [
    assets.contentHtml.sourcePath,
    assets.visualAudioHtml.sourcePath,
    assets.infographic.sourcePath,
    assets.audioMp3.sourcePath,
    assets.audioM4a.sourcePath,
    assets.audioScript.sourcePath,
    assets.presentation.sourcePath,
    ...assets.cases.map((item) => item.sourcePath),
    ...presentationSlides.map((slide) => slide.sourcePath),
  ];

  for (const sourcePath of sourcePaths) {
    const absolutePath = resolveSourcePath(sourcePath);
    const sourceStat = await stat(absolutePath);
    if (!sourceStat.isFile()) throw new Error(`Required AI Engineering source is not a file: ${sourcePath}`);
  }
}

async function copyPublicAssets(assets: AiEngineeringAssets) {
  assertInside(path.join(projectRoot, "public", "ai-engineering-assets"), publicModuleRoot);
  await rm(publicModuleRoot, { recursive: true, force: true });
  await mkdir(publicModuleRoot, { recursive: true });

  for (const asset of [assets.infographic, assets.audioMp3, assets.presentation]) {
    const destination = path.join(projectRoot, "public", asset.publicPath.replace(/^\//, ""));
    assertInside(publicModuleRoot, destination);
    await copyFile(resolveSourcePath(asset.sourcePath), destination);
  }

  for (const slide of presentationSlides) {
    const destination = path.join(projectRoot, "public", slide.publicPath.replace(/^\//, ""));
    assertInside(publicModuleRoot, destination);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(resolveSourcePath(slide.sourcePath), destination);
  }
}

async function prepareHtmlDocument(
  sourcePath: string,
  assetUrlsByFilename: Map<string, string>,
): Promise<AiEngineeringPreparedHtml> {
  const source = await readSourceText(sourcePath);
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

  const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]")).map(
    (section) => ({
      id: section.id,
      title: section.querySelector("h2, h3")?.textContent?.trim() ?? section.id,
      html: section.innerHTML.trim(),
    }),
  );

  return {
    title: document.title.trim(),
    html,
    introHtml: document.querySelector("body > header")?.innerHTML.trim() ?? "",
    footerHtml: document.querySelector("main > .footer")?.innerHTML.trim() ?? "",
    sections,
  };
}

async function readSourceText(sourcePath: string) {
  return readFile(resolveSourcePath(sourcePath), "utf8");
}

function resolveSourcePath(sourcePath: string) {
  const absolutePath = path.resolve(sourceRoot, sourcePath);
  assertInside(sourceRoot, absolutePath);
  return absolutePath;
}

function assertInside(parent: string, target: string) {
  const relative = path.relative(path.resolve(parent), path.resolve(target));
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path escapes the expected directory: ${target}`);
  }
}

const isMainModule = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isMainModule) {
  prepareAiEngineeringContent()
    .then(({ generatedModulePath: outputPath, publicModuleRoot: publicPath, digest }) => {
      console.log(`AI Engineering content prepared: ${path.relative(projectRoot, outputPath)}`);
      console.log(`AI Engineering media copied: ${path.relative(projectRoot, publicPath)}`);
      console.log(`AI Engineering digest: ${digest}`);
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
