import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import {
  generatedModulePath,
  prepareAiEngineeringContent,
  projectRoot,
} from "../../../../scripts/prepare-ai-engineering-content";
import type { PreparedAiEngineeringModule } from "@/lib/courses/types";
import { aiEngineeringManifest } from "./manifest";

let prepared: PreparedAiEngineeringModule;

beforeAll(async () => {
  await prepareAiEngineeringContent();
  prepared = JSON.parse(await readFile(generatedModulePath, "utf8")) as PreparedAiEngineeringModule;
});

describe("AI Engineering manifest preparation", () => {
  it("keeps the approved manifest metadata and learning path", () => {
    expect(aiEngineeringManifest.course).toBe("AI Engineering Aplicado");
    expect(aiEngineeringManifest.version).toBe("1.0");
    expect(aiEngineeringManifest.module.id).toBe("modulo-01");
    expect(aiEngineeringManifest.module.estimatedStudyMinutes).toBe(120);
    expect(aiEngineeringManifest.module.learningPath).toEqual([
      "orientacion",
      "contenido_fundacional",
      "infografia",
      "audio_explicativo",
      "casos_reales",
      "presentacion",
      "actividad",
      "autoevaluacion",
    ]);
  });

  it("requires every source file declared by the manifest", async () => {
    const sourcePaths = [
      prepared.assets.contentHtml.sourcePath,
      prepared.assets.visualAudioHtml.sourcePath,
      prepared.assets.infographic.sourcePath,
      prepared.assets.audioMp3.sourcePath,
      prepared.assets.audioM4a.sourcePath,
      prepared.assets.audioScript.sourcePath,
      prepared.assets.presentation.sourcePath,
      ...prepared.assets.cases.map((item) => item.sourcePath),
    ];

    for (const sourcePath of sourcePaths) {
      const sourceStat = await stat(path.join(projectRoot, "course-content", "ai-engineering", sourcePath));
      expect(sourceStat.isFile(), sourcePath).toBe(true);
    }
  });

  it("copies public media with stable routes and unchanged bytes", async () => {
    const publicAssets = [
      prepared.assets.infographic,
      prepared.assets.audioMp3,
      prepared.assets.audioM4a,
      prepared.assets.presentation,
    ];

    for (const asset of publicAssets) {
      expect(asset.publicPath).toMatch(/^\/ai-engineering-assets\/modulo-01\//);
      const source = await readFile(path.join(projectRoot, "course-content", "ai-engineering", asset.sourcePath));
      const copied = await readFile(path.join(projectRoot, "public", asset.publicPath.replace(/^\//, "")));
      expect(hash(copied), asset.publicPath).toBe(hash(source));
    }
  });

  it("removes document wrappers, global styles, scripts and inline handlers", () => {
    const documents = [
      prepared.content.foundational,
      prepared.content.visualAudio,
      ...prepared.content.cases,
    ];

    for (const document of documents) {
      expect(document.html).not.toMatch(/<!doctype|<\/?(?:html|head|body)\b/i);
      expect(document.html).not.toMatch(/<style\b|<script\b|\sstyle=|\son[a-z]+=/i);
      expect(document.html).toMatch(/<(?:header|main|section)\b/i);
    }
    expect(prepared.content.foundational.html).toContain("https://www.anthropic.com/engineering/building-effective-agents");
  });

  it("rewrites declared relative media links to stable public routes", () => {
    expect(prepared.content.visualAudio.html).toContain(prepared.assets.infographic.publicPath);
    expect(prepared.content.visualAudio.html).toContain(prepared.assets.audioMp3.publicPath);
    expect(prepared.content.visualAudio.html).toContain(prepared.assets.audioM4a.publicPath);
  });

  it("produces identical generated data on repeated runs", async () => {
    const first = hash(await readFile(generatedModulePath));
    await prepareAiEngineeringContent();
    const second = hash(await readFile(generatedModulePath));
    expect(second).toBe(first);
  });
});

function hash(value: Buffer) {
  return createHash("sha256").update(value).digest("hex");
}
