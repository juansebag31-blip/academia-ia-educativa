import { describe, expect, it } from "vitest";
import {
  calculateCourseProgress,
  findAdjacentModules,
  findAdjacentLessons,
  searchCourseCatalog,
  validateCourseSeed,
} from "./course";
import { courseSeed } from "@/lib/course-seed";
import { learningSections } from "@/lib/learning-flow";
import { buildMonthGrid, getSuggestedModuleOrderForDate, toIsoDate } from "@/lib/study-calendar";
import { buildModuleInfographic, programInfographicStages } from "@/lib/infographics";
import { programInfographicAssets, programInfographicContent } from "@/lib/program-infographic-content";
import { programMedia } from "@/lib/program-media";
import { programVisualResources } from "@/lib/program-visual-resources";
import { getModuleResourceBundle } from "@/lib/module-resource-bundles";
import { buildModuleExamSummary, getModulePdfUrl } from "@/lib/module-page";
import { buildModuleCertificateData } from "@/lib/module-certificate";
import { createModuleCertificatePdf } from "@/lib/module-certificate-pdf";

describe("course domain", () => {
  it("calculates course progress from completed lessons", () => {
    const progress = calculateCourseProgress([
      { lessonSlug: "a", status: "completed" },
      { lessonSlug: "b", status: "in_progress" },
      { lessonSlug: "c", status: "not_started" },
      { lessonSlug: "d", status: "completed" },
    ]);

    expect(progress.completed).toBe(2);
    expect(progress.total).toBe(4);
    expect(progress.percent).toBe(50);
  });

  it("resolves previous and next lessons across module boundaries", () => {
    const adjacent = findAdjacentLessons(courseSeed, "modulo-2-como-funciona-la-ia-generativa");

    expect(adjacent.previous?.slug).toBe("modulo-1-actividad-linea-de-tiempo");
    expect(adjacent.next?.slug).toBe("modulo-2-datos-tokens-y-patrones");
  });

  it("searches modules and lessons by title and content", () => {
    const results = searchCourseCatalog(courseSeed, "NotebookLM docentes");

    expect(results.some((result) => result.title.includes("NotebookLM para docentes"))).toBe(true);
    expect(results.some((result) => result.type === "lesson")).toBe(true);
  });

  it("ships the complete MVP seed without duplicate slugs", () => {
    const report = validateCourseSeed(courseSeed);

    expect(report.moduleCount).toBe(11);
    expect(report.lessonCount).toBeGreaterThanOrEqual(33);
    expect(report.duplicateSlugs).toEqual([]);
  });

  it("resolves previous and next modules at course boundaries", () => {
    expect(findAdjacentModules(courseSeed, courseSeed.modules[0].slug)).toMatchObject({
      previous: null,
      current: courseSeed.modules[0],
      next: courseSeed.modules[1],
    });
    expect(findAdjacentModules(courseSeed, courseSeed.modules[10].slug)).toMatchObject({
      previous: courseSeed.modules[9],
      current: courseSeed.modules[10],
      next: null,
    });
  });

  it("includes module images and embeddable video resources", () => {
    expect(courseSeed.modules.every((courseModule) => courseModule.image.src.startsWith("/course-assets/images/"))).toBe(true);
    expect(courseSeed.modules.every((courseModule) => courseModule.image.alt.length > 12)).toBe(true);

    const videos = courseSeed.modules.flatMap((courseModule) => courseModule.videos);

    expect(videos.length).toBeGreaterThan(0);
    expect(videos.every((video) => video.embedUrl.startsWith("https://www.youtube-nocookie.com/embed/"))).toBe(true);
    expect(videos.every((video) => video.thumbnailUrl.startsWith("https://img.youtube.com/vi/"))).toBe(true);
    expect(videos.every((video) => video.posterSrc.startsWith("/course-assets/images/"))).toBe(true);
  });

  it("uses the dedicated generative AI video in module 2", () => {
    expect(courseSeed.modules[1].videos).toHaveLength(2);
    expect(courseSeed.modules[1].videos[0]).toMatchObject({
      title: "Así funciona ChatGPT (explicado visualmente)",
      url: "https://www.youtube.com/watch?v=lVGV5-5TdTU",
      embedUrl: "https://www.youtube-nocookie.com/embed/lVGV5-5TdTU",
      thumbnailUrl: "https://img.youtube.com/vi/lVGV5-5TdTU/hqdefault.jpg",
    });
    expect(courseSeed.modules[1].videos[1]).toMatchObject({
      title: "Modelos de lenguaje explicados brevemente",
      url: "https://www.youtube.com/watch?v=LPZh9BOjkQs&t=1s",
      embedUrl: "https://www.youtube-nocookie.com/embed/LPZh9BOjkQs",
      startSeconds: 1,
      thumbnailUrl: "https://img.youtube.com/vi/LPZh9BOjkQs/hqdefault.jpg",
    });
  });

  it("keeps two complementary videos in module 1 and preserves the requested start time", () => {
    expect(courseSeed.modules[0].videos).toHaveLength(2);
    expect(courseSeed.modules[0].videos[1]).toMatchObject({
      title: "La historia completa de la Inteligencia Artificial",
      url: "https://www.youtube.com/watch?v=WCM0h9TX7cY&t=387s",
      embedUrl: "https://www.youtube-nocookie.com/embed/WCM0h9TX7cY",
      startSeconds: 387,
      thumbnailUrl: "https://img.youtube.com/vi/WCM0h9TX7cY/hqdefault.jpg",
    });
  });

  it("uses the dedicated AI data center video in module 3", () => {
    expect(courseSeed.modules[2].videos).toHaveLength(2);
    expect(courseSeed.modules[2].videos[0]).toMatchObject({
      title: "La construcción del centro de datos de IA más grande del mundo",
      url: "https://www.youtube.com/watch?v=zPgGb9f_J-I",
      embedUrl: "https://www.youtube-nocookie.com/embed/zPgGb9f_J-I",
      thumbnailUrl: "https://img.youtube.com/vi/zPgGb9f_J-I/hqdefault.jpg",
    });
    expect(courseSeed.modules[2].videos[1]).toMatchObject({
      title: "Así son los centros de IA en 2026",
      url: "https://www.youtube.com/watch?v=OQb_EUh7-NQ",
      embedUrl: "https://www.youtube-nocookie.com/embed/OQb_EUh7-NQ",
      thumbnailUrl: "https://img.youtube.com/vi/OQb_EUh7-NQ/hqdefault.jpg",
    });
  });

  it("keeps two complementary AI education tool videos in module 5", () => {
    expect(courseSeed.modules[4].videos).toHaveLength(2);
    expect(courseSeed.modules[4].videos[1]).toMatchObject({
      title: "IA en la educación 2026: herramientas que lo están cambiando todo",
      url: "https://www.youtube.com/watch?v=YhZ9FMg7h8I&t=192s",
      embedUrl: "https://www.youtube-nocookie.com/embed/YhZ9FMg7h8I",
      startSeconds: 192,
      thumbnailUrl: "https://img.youtube.com/vi/YhZ9FMg7h8I/hqdefault.jpg",
    });
  });

  it("keeps two complementary NotebookLM videos in module 6", () => {
    expect(courseSeed.modules[5].videos).toHaveLength(2);
    expect(courseSeed.modules[5].videos[1]).toMatchObject({
      title: "NotebookLM en 30 minutos: guía completa paso a paso",
      url: "https://www.youtube.com/watch?v=0xg49Hw-g4A&t=25s",
      embedUrl: "https://www.youtube-nocookie.com/embed/0xg49Hw-g4A",
      startSeconds: 25,
      thumbnailUrl: "https://img.youtube.com/vi/0xg49Hw-g4A/hqdefault.jpg",
    });
  });

  it("replaces the repeated module 7 video with two student learning resources", () => {
    expect(courseSeed.modules[6].videos).toHaveLength(2);
    expect(courseSeed.modules[6].videos[0]).toMatchObject({
      title: "Cómo usar NotebookLM para memorizar todo lo que estudias",
      url: "https://www.youtube.com/watch?v=MdqSwyVJ4Mc&t=33s",
      embedUrl: "https://www.youtube-nocookie.com/embed/MdqSwyVJ4Mc",
      startSeconds: 33,
      thumbnailUrl: "https://img.youtube.com/vi/MdqSwyVJ4Mc/hqdefault.jpg",
    });
    expect(courseSeed.modules[6].videos[1]).toMatchObject({
      title: "Cómo aprender en tiempo récord con IA",
      url: "https://www.youtube.com/watch?v=OefqBTBREgY&t=29s",
      embedUrl: "https://www.youtube-nocookie.com/embed/OefqBTBREgY",
      startSeconds: 29,
      thumbnailUrl: "https://img.youtube.com/vi/OefqBTBREgY/hqdefault.jpg",
    });
  });

  it("replaces the module 8 video with two NotebookLM teaching resources", () => {
    expect(courseSeed.modules[7].videos).toHaveLength(2);
    expect(courseSeed.modules[7].videos[0]).toMatchObject({
      title: "Usé NotebookLM durante 180 días para estudiar",
      url: "https://www.youtube.com/watch?v=LB3hS4Wv8ew&list=PLHR3PC5gXKOHv9ef81RAI1hFNR9g0x83S&index=3",
      embedUrl: "https://www.youtube-nocookie.com/embed/LB3hS4Wv8ew",
      thumbnailUrl: "https://img.youtube.com/vi/LB3hS4Wv8ew/hqdefault.jpg",
    });
    expect(courseSeed.modules[7].videos[1]).toMatchObject({
      title: "NotebookLM: la guía completa paso a paso",
      url: "https://www.youtube.com/watch?v=PcjdvMPOW6s&t=357s",
      embedUrl: "https://www.youtube-nocookie.com/embed/PcjdvMPOW6s",
      startSeconds: 357,
      thumbnailUrl: "https://img.youtube.com/vi/PcjdvMPOW6s/hqdefault.jpg",
    });
  });

  it("replaces the repeated module 9 video with two academic research resources", () => {
    expect(courseSeed.modules[8].videos).toHaveLength(2);
    expect(courseSeed.modules[8].videos[0]).toMatchObject({
      title: "Nuevo agente de IA de NotebookLM",
      url: "https://www.youtube.com/watch?v=6jucQFaFgFo&t=125s",
      embedUrl: "https://www.youtube-nocookie.com/embed/6jucQFaFgFo",
      startSeconds: 125,
      thumbnailUrl: "https://img.youtube.com/vi/6jucQFaFgFo/hqdefault.jpg",
    });
    expect(courseSeed.modules[8].videos[1]).toMatchObject({
      title: "IA para investigación académica",
      url: "https://www.youtube.com/watch?v=TV9_v4DCElw&t=176s",
      embedUrl: "https://www.youtube-nocookie.com/embed/TV9_v4DCElw",
      startSeconds: 176,
      thumbnailUrl: "https://img.youtube.com/vi/TV9_v4DCElw/hqdefault.jpg",
    });
  });

  it("replaces the repeated module 10 video with two final project resources", () => {
    expect(courseSeed.modules[9].videos).toHaveLength(2);
    expect(courseSeed.modules[9].videos[0]).toMatchObject({
      title: "NotebookLM desde cero: curso completo y actualizado",
      url: "https://www.youtube.com/watch?v=fOO9Sp_x-V4",
      embedUrl: "https://www.youtube-nocookie.com/embed/fOO9Sp_x-V4",
      thumbnailUrl: "https://img.youtube.com/vi/fOO9Sp_x-V4/hqdefault.jpg",
    });
    expect(courseSeed.modules[9].videos[1]).toMatchObject({
      title: "Flujo profesional con NotebookLM y Perplexity",
      url: "https://www.youtube.com/watch?v=j5dR7s0wOQs",
      embedUrl: "https://www.youtube-nocookie.com/embed/j5dR7s0wOQs",
      thumbnailUrl: "https://img.youtube.com/vi/j5dR7s0wOQs/hqdefault.jpg",
    });
  });

  it("replaces the repeated module 11 video with two continuous learning resources", () => {
    expect(courseSeed.modules[10].videos).toHaveLength(2);
    expect(courseSeed.modules[10].videos[0]).toMatchObject({
      title: "Por qué el aprendizaje constante es la clave del éxito",
      url: "https://www.youtube.com/watch?v=AYL2N6Cvtd4",
      embedUrl: "https://www.youtube-nocookie.com/embed/AYL2N6Cvtd4",
      thumbnailUrl: "https://img.youtube.com/vi/AYL2N6Cvtd4/hqdefault.jpg",
    });
    expect(courseSeed.modules[10].videos[1]).toMatchObject({
      title: "Cómo las pequeñas acciones pueden generar grandes cambios en tu vida",
      url: "https://www.youtube.com/watch?v=LjEwOaRfXjk",
      embedUrl: "https://www.youtube-nocookie.com/embed/LjEwOaRfXjk",
      thumbnailUrl: "https://img.youtube.com/vi/LjEwOaRfXjk/hqdefault.jpg",
    });
  });

  it("includes active learning resources for every module", () => {
    for (const courseModule of courseSeed.modules) {
      expect(courseModule.promptTemplates).toHaveLength(3);
      expect(courseModule.promptTemplates.every((template) => template.prompt.includes(courseModule.title.replace(/^Módulo \d+ - /, "")))).toBe(true);
      expect(courseModule.masteryChecklist.length).toBeGreaterThanOrEqual(5);
      expect(courseModule.lab.steps.length).toBeGreaterThanOrEqual(5);
      expect(courseModule.lab.deliverable).toContain("Entrega breve");
      expect(courseModule.flashcards.length).toBeGreaterThanOrEqual(5);
      expect(courseModule.guidedPath).toHaveLength(6);
      expect(courseModule.studentNotebook).toHaveLength(4);
      expect(courseModule.practiceQuiz).toHaveLength(3);
      expect(courseModule.rubric).toHaveLength(3);
      expect(courseModule.simulator).toHaveLength(5);
    }
  });

  it("orders the active learning panel as one progressive sequence", () => {
    expect(learningSections.map((section) => section.step)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(new Set(learningSections.map((section) => section.step)).size).toBe(learningSections.length);
    expect(learningSections.map((section) => section.title)).toEqual([
      "Ruta progresiva del módulo",
      "Cuaderno del estudiante",
      "Plantillas de prompts",
      "Simulador NotebookLM",
      "Laboratorio práctico",
      "Mini quiz de práctica",
      "Flashcards internas",
      "Checklist de dominio",
      "Rúbrica del producto",
    ]);
  });

  it("builds a complete study calendar month grid", () => {
    const days = buildMonthGrid(2026, 5);

    expect(days).toHaveLength(42);
    expect(days.some((day) => day.iso === "2026-06-01" && day.inCurrentMonth)).toBe(true);
    expect(days.some((day) => day.iso === "2026-07-01" && !day.inCurrentMonth)).toBe(true);
  });

  it("maps study weeks to course modules from a start date", () => {
    expect(getSuggestedModuleOrderForDate("2026-06-05", "2026-06-05", 11)).toBe(1);
    expect(getSuggestedModuleOrderForDate("2026-06-11", "2026-06-05", 11)).toBe(1);
    expect(getSuggestedModuleOrderForDate("2026-06-12", "2026-06-05", 11)).toBe(2);
    expect(getSuggestedModuleOrderForDate("2026-08-21", "2026-06-05", 11)).toBe(null);
  });

  it("formats local dates as iso calendar dates", () => {
    expect(toIsoDate(new Date(2026, 5, 5))).toBe("2026-06-05");
  });

  it("builds visual infographic data for the full program and every module", () => {
    expect(programInfographicStages).toHaveLength(4);
    expect(programInfographicStages.flatMap((stage) => stage.modules)).toHaveLength(11);

    for (const courseModule of courseSeed.modules) {
      const infographic = buildModuleInfographic(courseModule);

      expect(infographic.keyIdeas.length).toBeGreaterThanOrEqual(3);
      expect(infographic.workflow).toHaveLength(5);
      expect(infographic.finalEvidence).toBe(courseModule.product);
      expect(infographic.examTarget).toContain("80%");
    }
  });

  it("defines the approved general program infographic content", () => {
    expect(programInfographicContent.pillars).toHaveLength(4);
    expect(programInfographicContent.methodology.map((item) => item.percent)).toEqual([30, 50, 20]);
    expect(programInfographicContent.moduleRoute.flatMap((group) => group.modules)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(programInfographicAssets.horizontal).toBe("/course-assets/infographics/programa-ia-infografia-horizontal.png");
    expect(programInfographicAssets.vertical).toBe("/course-assets/infographics/programa-ia-infografia-vertical.png");
  });

  it("defines the official NotebookLM program media", () => {
    expect(programMedia.audio.src).toBe("/course-assets/media/aprendizaje-activo-notebooklm.m4a");
    expect(programMedia.audio.duration).toBe("21:51");
    expect(programMedia.video.src).toBe("/course-assets/media/ia-educativa-notebooklm.mp4");
    expect(programMedia.video.duration).toBe("7:25");
  });

  it("defines the NotebookLM visual resources for the program", () => {
    expect(programVisualResources.infographics).toHaveLength(2);
    expect(programVisualResources.infographics.every((resource) => resource.width === 2752 && resource.height === 1536)).toBe(true);
    expect(programVisualResources.conceptMaps).toHaveLength(1);
    expect(programVisualResources.documents.map((document) => document.pages)).toEqual([15, 3]);
    expect(programVisualResources.documents[1].src).toBe("/course-assets/study-guides/guia-estudio-programa-ia-notebooklm.pdf");
  });

  it("defines the complete NotebookLM resource bundle for module 1", () => {
    const bundle = getModuleResourceBundle("modulo-1-introduccion-historica-ia");

    expect(bundle?.media.video.duration).toBe("6:53");
    expect(bundle?.media.audio.duration).toBe("15:29");
    expect(bundle?.visuals).toHaveLength(3);
    expect(bundle?.documents.map((document) => document.pages)).toEqual([10, 3]);
  });

  it("defines the complete NotebookLM resource bundle for module 2", () => {
    const bundle = getModuleResourceBundle("modulo-2-ia-generativa-lenguaje-simple");

    expect(bundle?.media.video.duration).toBe("7:54");
    expect(bundle?.media.audio.duration).toBe("20:25");
    expect(bundle?.visuals).toHaveLength(3);
    expect(bundle?.visuals.every((visual) => visual.width === 2752 && visual.height === 1536)).toBe(true);
    expect(bundle?.documents.map((document) => document.pages)).toEqual([14, 3]);
    expect(bundle?.documents[0].src).toBe("/course-assets/modules/module-02/documents/generative-ai-blueprint.pdf");
  });

  it("defines the complete NotebookLM resource bundle for module 3", () => {
    const bundle = getModuleResourceBundle("modulo-3-infraestructura-datos-computacion");

    expect(bundle?.media.video.duration).toBe("8:07");
    expect(bundle?.media.audio.duration).toBe("18:55");
    expect(bundle?.visuals).toHaveLength(3);
    expect(bundle?.visuals.every((visual) => visual.width === 2752 && visual.height === 1536)).toBe(true);
    expect(bundle?.documents.map((document) => document.pages)).toEqual([13, 3]);
    expect(bundle?.documents[0].src).toBe("/course-assets/modules/module-03/documents/stratified-ai-architecture.pdf");
  });

  it("defines the complete NotebookLM resource bundle for module 4", () => {
    const bundle = getModuleResourceBundle("modulo-4-uso-responsable-etico-critico");

    expect(bundle?.media.video.duration).toBe("7:15");
    expect(bundle?.media.audio.duration).toBe("15:00");
    expect(bundle?.visuals).toHaveLength(3);
    expect(bundle?.visuals.every((visual) => visual.width === 2752 && visual.height === 1536)).toBe(true);
    expect(bundle?.documents.map((document) => document.pages)).toEqual([12, 3]);
    expect(bundle?.documents[0].src).toBe("/course-assets/modules/module-04/documents/ia-academica-responsable.pdf");
  });

  it("defines the complete NotebookLM resource bundle for module 5", () => {
    const bundle = getModuleResourceBundle("modulo-5-herramientas-ia-educacion");

    expect(bundle?.media.video.duration).toBe("6:13");
    expect(bundle?.media.audio.duration).toBe("14:00");
    expect(bundle?.visuals).toHaveLength(3);
    expect(bundle?.visuals.every((visual) => visual.width === 1376 && visual.height === 768)).toBe(true);
    expect(bundle?.documents.map((document) => document.pages)).toEqual([14, 4]);
    expect(bundle?.documents[0].src).toBe("/course-assets/modules/module-05/documents/pedagogical-ai-blueprint.pdf");
  });

  it("defines the complete NotebookLM resource bundle for module 6", () => {
    const bundle = getModuleResourceBundle("modulo-6-notebooklm-desde-cero");

    expect(bundle?.media.video.duration).toBe("7:27");
    expect(bundle?.media.audio.duration).toBe("10:17");
    expect(bundle?.visuals).toHaveLength(3);
    expect(bundle?.visuals.every((visual) => visual.width === 1376 && visual.height === 768)).toBe(true);
    expect(bundle?.documents.map((document) => document.pages)).toEqual([12, 3]);
    expect(bundle?.documents[0].src).toBe("/course-assets/modules/module-06/documents/notebooklm-cognitive-architecture.pdf");
  });

  it("defines the complete NotebookLM resource bundle for module 7", () => {
    const bundle = getModuleResourceBundle("modulo-7-notebooklm-para-estudiantes");

    expect(bundle?.media.video.duration).toBe("8:06");
    expect(bundle?.media.audio.duration).toBe("24:00");
    expect(bundle?.visuals).toHaveLength(3);
    expect(bundle?.visuals.map((visual) => [visual.width, visual.height])).toEqual([
      [2752, 1536],
      [2752, 1536],
      [1376, 768],
    ]);
    expect(bundle?.documents.map((document) => document.pages)).toEqual([13, 3]);
    expect(bundle?.documents[0].src).toBe("/course-assets/modules/module-07/documents/notebooklm-cognitive-cartography.pdf");
  });

  it("defines the complete NotebookLM resource bundle for module 8", () => {
    const bundle = getModuleResourceBundle("modulo-8-notebooklm-para-docentes");

    expect(bundle?.media.video.duration).toBe("6:46");
    expect(bundle?.media.audio.duration).toBe("13:02");
    expect(bundle?.visuals).toHaveLength(3);
    expect(bundle?.visuals.map((visual) => [visual.width, visual.height])).toEqual([
      [2752, 1536],
      [2752, 1536],
      [1376, 768],
    ]);
    expect(bundle?.documents.map((document) => document.pages)).toEqual([11, 3]);
    expect(bundle?.documents[0].src).toBe("/course-assets/modules/module-08/documents/notebooklm-pedagogical-architecture.pdf");
  });

  it("defines the complete NotebookLM resource bundle for module 9", () => {
    const bundle = getModuleResourceBundle("modulo-9-investigacion-academica-asistida");

    expect(bundle?.media.video.duration).toBe("7:05");
    expect(bundle?.media.audio.duration).toBe("14:08");
    expect(bundle?.visuals).toHaveLength(3);
    expect(bundle?.visuals.map((visual) => [visual.width, visual.height])).toEqual([
      [2752, 1536],
      [2752, 1536],
      [1376, 768],
    ]);
    expect(bundle?.documents.map((document) => document.pages)).toEqual([13, 3]);
    expect(bundle?.documents[0].src).toBe("/course-assets/modules/module-09/documents/rigorous-ai-research.pdf");
  });

  it("defines the complete NotebookLM resource bundle for module 10", () => {
    const bundle = getModuleResourceBundle("modulo-10-proyecto-final-aplicado");

    expect(bundle?.media.video.duration).toBe("6:51");
    expect(bundle?.media.audio.duration).toBe("19:26");
    expect(bundle?.visuals).toHaveLength(3);
    expect(bundle?.visuals.map((visual) => [visual.width, visual.height])).toEqual([
      [2752, 1536],
      [2752, 1536],
      [1376, 768],
    ]);
    expect(bundle?.documents.map((document) => document.pages)).toEqual([13, 3]);
    expect(bundle?.documents[0].src).toBe("/course-assets/modules/module-10/documents/cognitive-ai-architecture.pdf");
  });

  it("defines the complete NotebookLM resource bundle for module 11", () => {
    const bundle = getModuleResourceBundle("modulo-11-actualizacion-permanente");

    expect(bundle?.media.video.duration).toBe("11:27");
    expect(bundle?.media.audio.duration).toBe("11:41");
    expect(bundle?.visuals).toHaveLength(3);
    expect(bundle?.visuals.map((visual) => [visual.width, visual.height])).toEqual([
      [2752, 1536],
      [2752, 1536],
      [2752, 1536],
    ]);
    expect(bundle?.documents.map((document) => document.pages)).toEqual([14, 3]);
    expect(bundle?.documents[0].src).toBe("/course-assets/modules/module-11/documents/cognitive-cartography.pdf");
  });

  it("builds the visible source document URL for a module", () => {
    expect(getModulePdfUrl(courseSeed.modules[0].pdfFile)).toBe(
      "/course-assets/pdfs/Modulo_1_IA_Educativa_NotebookLM.pdf",
    );
  });

  it("summarizes the final module exam for every attempt state", () => {
    const courseModule = courseSeed.modules[0];

    expect(buildModuleExamSummary(courseModule)).toMatchObject({
      totalQuestions: 20,
      passingPercent: 80,
      status: "not_started",
      actionLabel: "Comenzar examen",
    });
    expect(
      buildModuleExamSummary(courseModule, {
        correct: 15,
        total: 20,
        percent: 75,
        passed: 0,
      }),
    ).toMatchObject({
      status: "retry",
      actionLabel: "Volver a intentar",
    });
    expect(
      buildModuleExamSummary(courseModule, {
        correct: 18,
        total: 20,
        percent: 90,
        passed: 1,
      }),
    ).toMatchObject({
      status: "passed",
      actionLabel: "Ver o repetir examen",
    });
  });

  it("builds certificate data only from an approved module attempt", () => {
    const courseModule = courseSeed.modules[0];
    const certificate = buildModuleCertificateData(courseModule, {
      correct: 18,
      total: 20,
      percent: 90,
      passed: 1,
      created_at: "2026-06-07T15:30:00.000Z",
    });

    expect(certificate.studentName).toBe("Juan Sebastian González");
    expect(certificate.hours).toBe(6);
    expect(certificate.score).toBe(90);
    expect(certificate.approvedAt).toBe("7 de junio de 2026");
    expect(certificate.certificateId).toBe("AIA-M01-JSG-20260607");
    expect(() =>
      buildModuleCertificateData(courseModule, {
        correct: 15,
        total: 20,
        percent: 75,
        passed: 0,
        created_at: "2026-06-07T15:30:00.000Z",
      }),
    ).toThrow("El módulo todavía no está aprobado");
  });

  it("generates a valid PDF certificate document", async () => {
    const certificate = buildModuleCertificateData(courseSeed.modules[0], {
      correct: 18,
      total: 20,
      percent: 90,
      passed: 1,
      created_at: "2026-06-07T15:30:00.000Z",
    });
    const pdf = await createModuleCertificatePdf(certificate);

    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe("%PDF-");
    expect(pdf.byteLength).toBeGreaterThan(5_000);
  });
});
