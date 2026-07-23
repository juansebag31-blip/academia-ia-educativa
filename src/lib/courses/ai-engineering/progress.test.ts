import { beforeEach, describe, expect, it } from "vitest";
import { aiEngineeringModuleOne } from "./module-01";
import { getAiEngineeringModule } from "./modules";
import {
  completeAiEngineeringStandardUnit,
  ensureAiEngineeringModuleCompletion,
  markAiEngineeringUnitInProgress,
  readAiEngineeringModuleProgress,
  recordAiEngineeringLastUnit,
} from "./progress";
import { buildAiEngineeringUnitStorageKey, writeAiEngineeringUnitState } from "./unit-storage";

const courseSlug = "ai-engineering-aplicado";
const moduleSlug = "modulo-01";
const units = aiEngineeringModuleOne.configuration.progressUnits;
const moduleThreeSlug = "modulo-03-contexto-estado-memoria";
const moduleThreeUnits = getAiEngineeringModule(moduleThreeSlug)?.configuration.progressUnits;
if (!moduleThreeUnits) throw new Error("AI Engineering Module 3 progress units are unavailable.");
const moduleFourSlug = "modulo-04-herramientas-apis-function-calling-mcp";
const moduleFourUnits = getAiEngineeringModule(moduleFourSlug)?.configuration.progressUnits;
if (!moduleFourUnits) throw new Error("AI Engineering Module 4 progress units are unavailable.");

beforeEach(() => window.localStorage.clear());

describe("AI Engineering module progress", () => {
  it("isolates Module 1 through Module 9 storage coordinates", () => {
    const moduleOneKey = buildAiEngineeringUnitStorageKey({
      courseSlug,
      moduleSlug,
      unitId: "contenido",
    });
    const moduleTwoKey = buildAiEngineeringUnitStorageKey({
      courseSlug,
      moduleSlug: "modulo-02-modelos-fundacionales-seleccion",
      unitId: "contenido",
    });
    const moduleThreeKey = buildAiEngineeringUnitStorageKey({
      courseSlug,
      moduleSlug: "modulo-03-contexto-estado-memoria",
      unitId: "contenido",
    });
    const moduleFourKey = buildAiEngineeringUnitStorageKey({
      courseSlug,
      moduleSlug: moduleFourSlug,
      unitId: "contenido",
    });
    const moduleFiveKey = buildAiEngineeringUnitStorageKey({
      courseSlug,
      moduleSlug: "modulo-05-rag-sistemas-conocimiento",
      unitId: "contenido",
    });
    const moduleSixKey = buildAiEngineeringUnitStorageKey({
      courseSlug,
      moduleSlug: "modulo-06-workflows-automatizacion",
      unitId: "contenido",
    });
    const moduleSevenKey = buildAiEngineeringUnitStorageKey({
      courseSlug,
      moduleSlug: "modulo-07-agentes-sistemas-multiagente",
      unitId: "contenido",
    });
    const moduleEightKey = buildAiEngineeringUnitStorageKey({
      courseSlug,
      moduleSlug: "modulo-08-evaluacion-observabilidad-trazabilidad",
      unitId: "contenido",
    });
    const moduleNineKey = buildAiEngineeringUnitStorageKey({
      courseSlug,
      moduleSlug: "modulo-09-seguridad-guardrails-supervision",
      unitId: "contenido",
    });

    expect(new Set([
      moduleOneKey,
      moduleTwoKey,
      moduleThreeKey,
      moduleFourKey,
      moduleFiveKey,
      moduleSixKey,
      moduleSevenKey,
      moduleEightKey,
      moduleNineKey,
    ]).size).toBe(9);
    expect(moduleOneKey).toContain(encodeURIComponent(moduleSlug));
    expect(moduleTwoKey).toContain(encodeURIComponent("modulo-02-modelos-fundacionales-seleccion"));
    expect(moduleThreeKey).toContain(encodeURIComponent("modulo-03-contexto-estado-memoria"));
    expect(moduleFourKey).toContain(encodeURIComponent(moduleFourSlug));
    expect(moduleFiveKey).toContain(encodeURIComponent("modulo-05-rag-sistemas-conocimiento"));
    expect(moduleSixKey).toContain(encodeURIComponent("modulo-06-workflows-automatizacion"));
    expect(moduleSevenKey).toContain(encodeURIComponent("modulo-07-agentes-sistemas-multiagente"));
    expect(moduleEightKey).toContain(encodeURIComponent("modulo-08-evaluacion-observabilidad-trazabilidad"));
    expect(moduleNineKey).toContain(encodeURIComponent("modulo-09-seguridad-guardrails-supervision"));
  });

  it("keeps a visited unit in progress until the student confirms completion", () => {
    const infographic = units.find((unit) => unit.kind === "infographic");
    if (!infographic) throw new Error("Infographic unit is unavailable.");
    markAiEngineeringUnitInProgress(courseSlug, moduleSlug, infographic);
    recordAiEngineeringLastUnit(courseSlug, moduleSlug, infographic.id);

    const snapshot = readAiEngineeringModuleProgress(courseSlug, moduleSlug, units);
    expect(snapshot.statuses[infographic.id]).toBe("in-progress");
    expect(snapshot.completedCount).toBe(0);
    expect(snapshot.percentage).toBe(0);
    expect(snapshot.lastUnitId).toBe(infographic.id);
  });

  it("derives activity and assessment completion from their configured records", () => {
    const activity = units.find((unit) => unit.kind === "activity");
    const assessment = units.find((unit) => unit.kind === "self-assessment");
    if (!activity || !assessment) throw new Error("Interactive units are unavailable.");
    writeAiEngineeringUnitState(
      { courseSlug, moduleSlug, unitId: activity.id },
      { response: "Mapa", completed: true },
    );
    writeAiEngineeringUnitState(
      { courseSlug, moduleSlug, unitId: assessment.id },
      { responses: { "respuesta-1": "Respuesta" }, reviewed: true },
    );

    const snapshot = readAiEngineeringModuleProgress(courseSlug, moduleSlug, units);
    expect(snapshot.statuses[activity.id]).toBe("completed");
    expect(snapshot.statuses[assessment.id]).toBe("completed");
    expect(snapshot.completedCount).toBe(2);
    expect(snapshot.percentage).toBe(25);
  });

  it("calculates completion from a variable unit collection", () => {
    const variableUnits = units.slice(0, 3);
    for (const unit of variableUnits) completeAiEngineeringStandardUnit(courseSlug, moduleSlug, unit.id);
    const snapshot = readAiEngineeringModuleProgress(courseSlug, moduleSlug, variableUnits);
    expect(snapshot.completedCount).toBe(3);
    expect(snapshot.percentage).toBe(100);
    expect(ensureAiEngineeringModuleCompletion(courseSlug, moduleSlug, variableUnits)).toEqual(expect.any(String));
  });

  it("records module completion after every configured unit is complete", () => {
    for (const unit of units) {
      if (unit.kind === "activity") {
        writeAiEngineeringUnitState(
          { courseSlug, moduleSlug, unitId: unit.id },
          { response: "Mapa", completed: true, status: "completed" },
        );
      } else if (unit.kind === "self-assessment") {
        writeAiEngineeringUnitState(
          { courseSlug, moduleSlug, unitId: unit.id },
          { responses: {}, reviewed: true, status: "completed" },
        );
      } else {
        completeAiEngineeringStandardUnit(courseSlug, moduleSlug, unit.id);
      }
    }

    expect(readAiEngineeringModuleProgress(courseSlug, moduleSlug, units).percentage).toBe(100);
    const completedAt = ensureAiEngineeringModuleCompletion(courseSlug, moduleSlug, units);
    expect(completedAt).toEqual(expect.any(String));
    expect(ensureAiEngineeringModuleCompletion(courseSlug, moduleSlug, units)).toBe(completedAt);
    expect(readAiEngineeringModuleProgress(courseSlug, moduleSlug, units).completedAt).toBe(completedAt);
  });

  it("allows Module 3 to reach 100% without changing other module progress", () => {
    for (const unit of moduleThreeUnits) {
      if (unit.kind === "activity") {
        writeAiEngineeringUnitState(
          { courseSlug, moduleSlug: moduleThreeSlug, unitId: unit.id },
          { response: "Mapa", completed: true, status: "completed" },
        );
      } else if (unit.kind === "self-assessment") {
        writeAiEngineeringUnitState(
          { courseSlug, moduleSlug: moduleThreeSlug, unitId: unit.id },
          { responses: {}, reviewed: true, status: "completed" },
        );
      } else {
        completeAiEngineeringStandardUnit(courseSlug, moduleThreeSlug, unit.id);
      }
    }

    expect(moduleThreeUnits).toHaveLength(8);
    expect(readAiEngineeringModuleProgress(courseSlug, moduleThreeSlug, moduleThreeUnits).percentage).toBe(100);
    expect(readAiEngineeringModuleProgress(courseSlug, moduleSlug, units).percentage).toBe(0);
    expect(readAiEngineeringModuleProgress(
      courseSlug,
      "modulo-02-modelos-fundacionales-seleccion",
      moduleThreeUnits,
    ).percentage).toBe(0);
  });

  it("allows Module 4 to reach 100% without changing other module progress", () => {
    for (const unit of moduleFourUnits) {
      if (unit.kind === "activity") {
        writeAiEngineeringUnitState(
          { courseSlug, moduleSlug: moduleFourSlug, unitId: unit.id },
          { response: "Mapa", completed: true, status: "completed" },
        );
      } else if (unit.kind === "self-assessment") {
        writeAiEngineeringUnitState(
          { courseSlug, moduleSlug: moduleFourSlug, unitId: unit.id },
          { responses: {}, reviewed: true, status: "completed" },
        );
      } else {
        completeAiEngineeringStandardUnit(courseSlug, moduleFourSlug, unit.id);
      }
    }

    expect(moduleFourUnits).toHaveLength(8);
    expect(readAiEngineeringModuleProgress(courseSlug, moduleFourSlug, moduleFourUnits).percentage).toBe(100);
    expect(readAiEngineeringModuleProgress(courseSlug, moduleSlug, units).percentage).toBe(0);
    expect(readAiEngineeringModuleProgress(
      courseSlug,
      "modulo-02-modelos-fundacionales-seleccion",
      moduleFourUnits,
    ).percentage).toBe(0);
    expect(readAiEngineeringModuleProgress(courseSlug, moduleThreeSlug, moduleThreeUnits).percentage).toBe(0);
  });
});
