import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import {
  generatedModulesPath,
  prepareAiEngineeringContent,
  prepareAiEngineeringModulePackage,
  projectRoot,
} from "../../../../scripts/prepare-ai-engineering-content";
import type { PreparedAiEngineeringModule } from "@/lib/courses/types";
import { resolveCourseModule } from "@/lib/courses/catalog";
import {
  parseAiEngineeringCourseManifest,
  parseAiEngineeringModuleManifest,
  type AiEngineeringModuleManifest,
} from "./module-contract";
import {
  aiEngineeringCourseManifest,
  aiEngineeringManifest,
} from "./manifest";
import {
  validateAiEngineeringCoursePackage,
  validateAiEngineeringModulePackage,
} from "./module-validator";

let prepared: PreparedAiEngineeringModule;
let preparedModuleTwo: PreparedAiEngineeringModule;
let preparedModuleThree: PreparedAiEngineeringModule;
let preparedModuleFour: PreparedAiEngineeringModule;
let fixtureRoot = "";
let fixturePublicRoot = "";
let fixtureManifest: AiEngineeringModuleManifest;

beforeAll(async () => {
  await prepareAiEngineeringContent();
  const preparedModules = JSON.parse(await readFile(generatedModulesPath, "utf8")) as PreparedAiEngineeringModule[];
  prepared = preparedModules[0];
  preparedModuleTwo = preparedModules.find(
    (module) => module.moduleSlug === "modulo-02-modelos-fundacionales-seleccion",
  ) as PreparedAiEngineeringModule;
  if (!preparedModuleTwo) throw new Error("Prepared AI Engineering Module 2 is unavailable.");
  preparedModuleThree = preparedModules.find(
    (module) => module.moduleSlug === "modulo-03-contexto-estado-memoria",
  ) as PreparedAiEngineeringModule;
  if (!preparedModuleThree) throw new Error("Prepared AI Engineering Module 3 is unavailable.");
  preparedModuleFour = preparedModules.find(
    (module) => module.moduleSlug === "modulo-04-herramientas-apis-function-calling-mcp",
  ) as PreparedAiEngineeringModule;
  if (!preparedModuleFour) throw new Error("Prepared AI Engineering Module 4 is unavailable.");
  fixtureRoot = await mkdtemp(path.join(tmpdir(), "ai-engineering-module-fixture-"));
  fixturePublicRoot = path.join(fixtureRoot, "public");
  fixtureManifest = await createValidPrivateFixture(fixtureRoot);
});

afterAll(async () => {
  if (fixtureRoot) await rm(fixtureRoot, { recursive: true, force: true });
});

describe("AI Engineering course contract", () => {
  it("keeps the approved twelve-module editorial itinerary", () => {
    expect(aiEngineeringCourseManifest.modules).toHaveLength(12);
    expect(aiEngineeringCourseManifest.modules.map((module) => module.title)).toEqual([
      "De un modelo a un sistema inteligente",
      "Modelos fundacionales y selección",
      "Contexto, estado y memoria",
      "Herramientas, APIs, function calling y MCP",
      "RAG y sistemas de conocimiento",
      "Workflows y automatización",
      "Agentes y sistemas multiagente",
      "Evaluación, observabilidad y trazabilidad",
      "Seguridad, guardrails y supervisión",
      "Coste, velocidad y confiabilidad",
      "Producto y automatización empresarial",
      "Producción y proyecto final",
    ]);
    expect(aiEngineeringCourseManifest.modules[0]).toMatchObject({
      editorialSlug: "modulo-01-modelo-a-sistema-inteligente",
      publicSlug: "modulo-01",
      editorialStatus: "approved",
      publish: true,
    });
    expect(aiEngineeringCourseManifest.modules[1]).toMatchObject({
      editorialSlug: "modulo-02-modelos-fundacionales-seleccion",
      publicSlug: "modulo-02-modelos-fundacionales-seleccion",
      editorialStatus: "approved",
      publish: true,
      manifestPath: "modules/modulo-02-modelos-fundacionales-seleccion/module-manifest.json",
    });
    expect(aiEngineeringCourseManifest.modules[2]).toMatchObject({
      editorialSlug: "modulo-03-contexto-estado-memoria",
      publicSlug: "modulo-03-contexto-estado-memoria",
      editorialStatus: "approved",
      publish: true,
      manifestPath: "modules/modulo-03-contexto-estado-memoria/module-manifest.json",
    });
    expect(aiEngineeringCourseManifest.modules[3]).toMatchObject({
      editorialSlug: "modulo-04-herramientas-apis-function-calling-mcp",
      publicSlug: "modulo-04-herramientas-apis-function-calling-mcp",
      editorialStatus: "approved",
      publish: true,
      manifestPath: "modules/modulo-04-herramientas-apis-function-calling-mcp/module-manifest.json",
    });
    expect(aiEngineeringCourseManifest.modules[4]).toMatchObject({
      editorialSlug: "modulo-05-rag-sistemas-conocimiento",
      publicSlug: "modulo-05-rag-sistemas-conocimiento",
      editorialStatus: "approved",
      publish: true,
      manifestPath: "modules/modulo-05-rag-sistemas-conocimiento/module-manifest.json",
    });
    expect(aiEngineeringCourseManifest.modules[5]).toMatchObject({
      editorialSlug: "modulo-06-workflows-automatizacion",
      publicSlug: "modulo-06-workflows-automatizacion",
      editorialStatus: "approved",
      publish: true,
      manifestPath: "modules/modulo-06-workflows-automatizacion/module-manifest.json",
    });
    expect(aiEngineeringCourseManifest.modules[6]).toMatchObject({
      editorialSlug: "modulo-07-agentes-sistemas-multiagente",
      publicSlug: "modulo-07-agentes-sistemas-multiagente",
      editorialStatus: "approved",
      publish: true,
      manifestPath: "modules/modulo-07-agentes-sistemas-multiagente/module-manifest.json",
    });
    expect(aiEngineeringCourseManifest.modules[7]).toMatchObject({
      editorialSlug: "modulo-08-evaluacion-observabilidad-trazabilidad",
      publicSlug: "modulo-08-evaluacion-observabilidad-trazabilidad",
      editorialStatus: "approved",
      publish: true,
      manifestPath: "modules/modulo-08-evaluacion-observabilidad-trazabilidad/module-manifest.json",
    });
    expect(aiEngineeringCourseManifest.modules[8]).toMatchObject({
      editorialSlug: "modulo-09-seguridad-guardrails-supervision",
      publicSlug: "modulo-09-seguridad-guardrails-supervision",
      editorialStatus: "approved",
      publish: true,
      manifestPath: "modules/modulo-09-seguridad-guardrails-supervision/module-manifest.json",
    });
    expect(aiEngineeringCourseManifest.modules[9]).toMatchObject({
      editorialSlug: "modulo-10-coste-velocidad-confiabilidad",
      publicSlug: "modulo-10-coste-velocidad-confiabilidad",
      editorialStatus: "approved",
      publish: true,
      manifestPath: "modules/modulo-10-coste-velocidad-confiabilidad/module-manifest.json",
    });
    expect(aiEngineeringCourseManifest.modules.slice(10).every((module) => !module.publish)).toBe(true);
  });

  it("prepares and resolves Module 2 with all manifest-declared resources", () => {
    expect(preparedModuleTwo.configuration.progressUnits).toHaveLength(8);
    expect(preparedModuleTwo.content.cases).toHaveLength(3);
    expect(preparedModuleTwo.presentation.slides).toHaveLength(
      preparedModuleTwo.configuration.assets.presentation.slideCount,
    );
    expect(preparedModuleTwo.configuration.visuals).toHaveLength(5);
    expect(preparedModuleTwo.configuration.keyIdeas).toHaveLength(3);
    expect(preparedModuleTwo.configuration.content.selfAssessment.questionCount).toBe(10);
    expect(resolveCourseModule(
      "ai-engineering-aplicado",
      "modulo-02-modelos-fundacionales-seleccion",
    )?.summary.title).toBe("Modelos fundacionales y selección");
  });

  it("prepares and resolves Module 3 with all manifest-declared resources", () => {
    expect(preparedModuleThree.configuration.progressUnits).toHaveLength(8);
    expect(preparedModuleThree.content.cases).toHaveLength(3);
    expect(preparedModuleThree.presentation.slides).toHaveLength(15);
    expect(preparedModuleThree.configuration.visuals).toHaveLength(5);
    expect(preparedModuleThree.configuration.keyIdeas).toHaveLength(3);
    expect(preparedModuleThree.configuration.content.selfAssessment.questionCount).toBe(12);
    expect(resolveCourseModule(
      "ai-engineering-aplicado",
      "modulo-03-contexto-estado-memoria",
    )?.summary.title).toBe("Contexto, estado y memoria");
  });

  it("prepares and resolves Module 4 with all manifest-declared resources", () => {
    expect(preparedModuleFour.configuration.progressUnits).toHaveLength(8);
    expect(preparedModuleFour.content.cases).toHaveLength(3);
    expect(preparedModuleFour.presentation.slides).toHaveLength(21);
    expect(preparedModuleFour.configuration.visuals).toHaveLength(5);
    expect(preparedModuleFour.configuration.keyIdeas).toHaveLength(3);
    expect(preparedModuleFour.configuration.content.selfAssessment.questionCount).toBe(12);
    expect(resolveCourseModule(
      "ai-engineering-aplicado",
      "modulo-04-herramientas-apis-function-calling-mcp",
    )?.summary.title).toBe("Herramientas, APIs, function calling y MCP");
  });

  it("keeps Module 1 public route and derives declared quantities", () => {
    expect(aiEngineeringManifest.module.publicSlug).toBe("modulo-01");
    expect(aiEngineeringManifest.module.progressUnits).toHaveLength(8);
    expect(aiEngineeringManifest.module.assets.cases).toHaveLength(3);
    expect(aiEngineeringManifest.module.content.selfAssessment.questionCount).toBe(8);
    expect(aiEngineeringManifest.module.assets.presentation.slideCount).toBe(17);
    expect(prepared.presentation.slides).toHaveLength(17);
  });

  it("rejects unresolved placeholders and invalid public states", () => {
    const todoManifest = structuredClone(aiEngineeringManifest);
    todoManifest.module.title = "TODO_TITLE";
    expect(() => parseAiEngineeringModuleManifest(todoManifest)).toThrow(/TODO_TITLE/);

    const draftPublic = structuredClone(aiEngineeringManifest);
    draftPublic.module.editorialStatus = "draft";
    expect(() => parseAiEngineeringModuleManifest(draftPublic)).toThrow(/cannot publish/);

    const duplicateCourse = structuredClone(aiEngineeringCourseManifest);
    duplicateCourse.modules[1].editorialSlug = duplicateCourse.modules[0].editorialSlug;
    expect(() => parseAiEngineeringCourseManifest(duplicateCourse)).toThrow(/duplicates/);
  });
});

describe("AI Engineering manifest preparation", () => {
  it("copies public media with stable routes and unchanged bytes", async () => {
    for (const asset of [prepared.assets.infographic, prepared.assets.audioMp3, prepared.assets.presentation]) {
      expect(asset.publicPath).toMatch(/^\/ai-engineering-assets\/modulo-01\//);
      const source = await readFile(path.join(projectRoot, "course-content", "ai-engineering", asset.sourcePath));
      const copied = await readFile(path.join(projectRoot, "public", asset.publicPath.replace(/^\//, "")));
      expect(hash(copied), asset.publicPath).toBe(hash(source));
    }
    for (const slide of prepared.presentation.slides) {
      expect(slide.publicPath).toMatch(/^\/ai-engineering-assets\/modulo-01\/slides\/slide-\d{2}\.webp$/);
    }
    expect(prepared.assets.audioM4a?.sourcePath).toBe(aiEngineeringManifest.module.assets.audio.m4aSourcePath);
    const copiedNames = await readdir(path.join(projectRoot, "public", "ai-engineering-assets", "modulo-01"));
    expect(copiedNames.some((fileName) => fileName.toLowerCase().endsWith(".m4a"))).toBe(false);
  });

  it("copies Modules 2, 3 and 4 public assets while keeping their M4A sources private", async () => {
    for (const preparedModule of [preparedModuleTwo, preparedModuleThree, preparedModuleFour]) {
      const publicDirectory = path.join(
        projectRoot,
        "public",
        "ai-engineering-assets",
        preparedModule.moduleSlug,
      );
      const copiedFiles = await readdir(publicDirectory, { recursive: true });

      expect(copiedFiles.filter((fileName) => fileName.endsWith(".webp"))).toHaveLength(
        preparedModule.configuration.assets.presentation.slideCount,
      );
      expect(copiedFiles.filter((fileName) => fileName.endsWith(".png"))).toHaveLength(6);
      expect(copiedFiles.filter((fileName) => fileName.endsWith(".mp3"))).toHaveLength(1);
      expect(copiedFiles.filter((fileName) => fileName.endsWith(".pptx"))).toHaveLength(1);
      expect(copiedFiles.some((fileName) => fileName.toLowerCase().endsWith(".m4a"))).toBe(false);
    }
  });

  it("removes wrappers, global styles, scripts and inline handlers", () => {
    const documents = [prepared.content.foundational, prepared.content.visualAudio, ...prepared.content.cases]
      .filter((document): document is NonNullable<typeof document> => Boolean(document));
    for (const document of documents) {
      expect(document.html).not.toMatch(/<!doctype|<\/?(?:html|head|body)\b/i);
      expect(document.html).not.toMatch(/<style\b|<script\b|\sstyle=|\son[a-z]+=/i);
      expect(document.html).toMatch(/<(?:header|main|section)\b/i);
    }
  });

  it("extracts approved sections and the declared assessment questions", () => {
    const evaluation = prepared.content.foundational.sections.find(
      (section) => section.id === aiEngineeringManifest.module.content.selfAssessment.sectionId,
    );
    const document = new JSDOM(`<section>${evaluation?.html ?? ""}</section>`).window.document;
    expect(document.querySelectorAll(aiEngineeringManifest.module.content.selfAssessment.questionSelector))
      .toHaveLength(aiEngineeringManifest.module.content.selfAssessment.questionCount);
  });

  it("produces identical generated data on repeated runs", async () => {
    const first = hash(await readFile(generatedModulesPath));
    await prepareAiEngineeringContent();
    const second = hash(await readFile(generatedModulesPath));
    expect(second).toBe(first);
  }, 10_000);
});

describe("controlled non-public module fixture", () => {
  it("resolves nested module assets from the manifest directory", async () => {
    const courseRoot = path.join(fixtureRoot, "nested-course");
    const packageRoot = path.join(courseRoot, "modules", "modulo-prueba");
    const manifest = await createValidPrivateFixture(packageRoot);
    await writeFile(
      path.join(packageRoot, "module-manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8",
    );

    const validation = await validateAiEngineeringCoursePackage({
      schemaVersion: 1,
      courseSlug: manifest.courseSlug,
      title: "Curso ficticio de prueba",
      modules: [{
        number: manifest.module.number,
        title: manifest.module.title,
        editorialSlug: manifest.module.editorialSlug,
        publicSlug: manifest.module.publicSlug,
        editorialStatus: manifest.module.editorialStatus,
        publish: manifest.module.publish,
        manifestPath: "modules/modulo-prueba/module-manifest.json",
      }],
    }, courseRoot);

    expect(validation.modules).toHaveLength(1);
    expect(validation.modules[0].packageRoot).toBe(packageRoot);
    expect(validation.modules[0].sourceFiles).toContain("visual.png");
  });

  it("validates and prepares variable cases, questions, slides and progress without public registration", async () => {
    const validation = await validateAiEngineeringModulePackage(fixtureManifest, fixtureRoot);
    expect(validation.caseCount).toBe(1);
    expect(validation.questionCount).toBe(2);
    expect(validation.slideCount).toBe(2);
    expect(fixtureManifest.module.progressUnits).toHaveLength(3);

    const fixture = await prepareAiEngineeringModulePackage(fixtureManifest, fixtureRoot, fixturePublicRoot);
    expect(fixture.presentation.slides).toHaveLength(2);
    expect(fixture.content.cases).toHaveLength(1);
    const imageVisual = fixture.configuration.visuals?.find((visual) => "sourcePath" in visual);
    expect(imageVisual && "publicPath" in imageVisual ? imageVisual.publicPath : undefined)
      .toBe("/ai-engineering-assets/modulo-prueba-no-publicable/visuals/visual.png");
    expect(await readFile(path.join(fixturePublicRoot, "modulo-prueba-no-publicable", "visuals", "visual.png"), "utf8"))
      .toBe("ASSET FICTICIO DE PRUEBA: visual.png");
    expect(resolveCourseModule("ai-engineering-aplicado", fixture.moduleSlug)).toBeNull();
  });

  it("rejects missing files, missing visual anchors and quantity mismatches", async () => {
    const missingFile = structuredClone(fixtureManifest);
    missingFile.module.assets.audio.mp3SourcePath = "missing.mp3";
    await expect(validateAiEngineeringModulePackage(missingFile, fixtureRoot)).rejects.toThrow(/missing\.mp3/);

    const missingAnchor = structuredClone(fixtureManifest);
    missingAnchor.module.visuals = [{
      afterSection: "inexistente",
      visualId: "visual-prueba",
      title: "Visual de prueba",
      description: "Descripción de prueba",
      componentType: "model-vs-system",
    }];
    await expect(validateAiEngineeringModulePackage(missingAnchor, fixtureRoot)).rejects.toThrow(/missing section/);

    const questionMismatch = structuredClone(fixtureManifest);
    questionMismatch.module.content.selfAssessment.questionCount = 3;
    await expect(validateAiEngineeringModulePackage(questionMismatch, fixtureRoot)).rejects.toThrow(/declares 3 questions but found 2/);

    const emptyQuestions = structuredClone(fixtureManifest);
    emptyQuestions.module.content.selfAssessment.questionSelector = ".pregunta-inexistente";
    await expect(validateAiEngineeringModulePackage(emptyQuestions, fixtureRoot)).rejects.toThrow(/must contain non-empty items/);

    const emptyActivityPath = path.join(fixtureRoot, "content-empty-activity.html");
    const originalHtml = await readFile(path.join(fixtureRoot, "content.html"), "utf8");
    await writeFile(emptyActivityPath, originalHtml.replace("<p>Consigna de prueba.</p>", ""), "utf8");
    const emptyActivity = structuredClone(fixtureManifest);
    emptyActivity.module.content.foundationalHtml = "content-empty-activity.html";
    await expect(validateAiEngineeringModulePackage(emptyActivity, fixtureRoot)).rejects.toThrow(/no non-empty prompt/);

    const slideMismatch = structuredClone(fixtureManifest);
    slideMismatch.module.assets.presentation.slideCount = 3;
    await expect(validateAiEngineeringModulePackage(slideMismatch, fixtureRoot)).rejects.toThrow(/slide-03/);
  });
});

async function createValidPrivateFixture(root: string): Promise<AiEngineeringModuleManifest> {
  const manifest = structuredClone(aiEngineeringManifest);
  manifest.module = {
    ...manifest.module,
    editorialSlug: "modulo-prueba-no-publicable",
    publicSlug: "modulo-prueba-no-publicable",
    number: 99,
    title: "Módulo de prueba no publicable",
    editorialStatus: "reviewed",
    publish: false,
    content: {
      foundationalHtml: "content.html",
      objectives: { sectionId: "proposito", selector: "ul > li" },
      activity: { sectionId: "actividad" },
      selfAssessment: { sectionId: "evaluacion", questionSelector: "ol > li", questionCount: 2 },
      sources: { sectionId: "fuentes", itemSelector: "ol > li" },
    },
    assets: {
      infographic: { sourcePath: "infografia.png", title: "Infografía de prueba", alt: "Infografía ficticia de prueba" },
      audio: { mp3SourcePath: "audio.mp3", transcriptSourcePath: "transcripcion.txt", title: "Audio de prueba" },
      cases: [{ id: "caso-prueba", sourcePath: "caso.html" }],
      presentation: {
        sourcePath: "presentacion.pptx",
        title: "Presentación de prueba",
        slidesDirectory: "slides",
        slideCount: 2,
        slideFilePattern: "slide-{number:2}.webp",
        slideWidth: 16,
        slideHeight: 9,
        slideAltTemplate: "Diapositiva {current} de {total} de prueba",
      },
    },
    sections: { casesTitle: "Caso de prueba", presentationTitle: "Presentación de prueba" },
    interactions: {
      activity: { unitId: "actividad", responseLabel: "Respuesta", placeholder: "Escribe una respuesta de prueba." },
      selfAssessment: { unitId: "autoevaluacion" },
    },
    progressUnits: [
      { id: "contenido", kind: "foundational-content", sectionId: "contenido", label: "Contenido" },
      { id: "actividad", kind: "activity", sectionId: "actividad", label: "Actividad" },
      { id: "autoevaluacion", kind: "self-assessment", sectionId: "autoevaluacion", label: "Autoevaluación" },
    ],
    visuals: [{
      afterSection: "proposito",
      visualId: "visual-prueba-imagen",
      sourcePath: "visual.png",
      alt: "Visual ficticio de prueba",
      width: 16,
      height: 9,
    }],
    keyIdeas: [{
      afterSection: "proposito",
      ideaId: "idea-prueba",
      title: "Idea de prueba",
      text: "Texto ficticio de prueba.",
    }],
  };

  await mkdir(path.join(root, "slides"), { recursive: true });
  await writeFile(path.join(root, "content.html"), `<!doctype html><html><body><main>
    <section id="proposito"><h2>Propósito</h2><ul><li>Objetivo de prueba.</li></ul></section>
    <section id="actividad"><h2>Actividad</h2><p>Consigna de prueba.</p></section>
    <section id="evaluacion"><h2>Autoevaluación</h2><ol><li>Pregunta uno.</li><li>Pregunta dos.</li></ol></section>
    <section id="fuentes"><h2>Fuentes</h2><ol><li>Fuente de prueba. <a href="https://example.com">Enlace</a></li></ol></section>
  </main></body></html>`, "utf8");
  await writeFile(path.join(root, "caso.html"), "<html><body><main><section id=\"caso\"><h2>Caso ficticio de prueba</h2></section></main></body></html>", "utf8");
  await writeFile(path.join(root, "transcripcion.txt"), "Transcripción ficticia de prueba.", "utf8");
  for (const fileName of ["infografia.png", "visual.png", "audio.mp3", "presentacion.pptx", "slides/slide-01.webp", "slides/slide-02.webp"]) {
    await writeFile(path.join(root, fileName), `ASSET FICTICIO DE PRUEBA: ${fileName}`, "utf8");
  }
  return parseAiEngineeringModuleManifest(manifest);
}

function hash(value: Buffer) {
  return createHash("sha256").update(value).digest("hex");
}
