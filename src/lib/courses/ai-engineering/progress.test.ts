import { beforeEach, describe, expect, it } from "vitest";
import {
  aiEngineeringProgressUnits,
  completeAiEngineeringStandardUnit,
  ensureAiEngineeringModuleCompletion,
  markAiEngineeringUnitInProgress,
  readAiEngineeringModuleProgress,
  recordAiEngineeringLastUnit,
} from "./progress";
import { writeAiEngineeringUnitState } from "./unit-storage";

const courseSlug = "ai-engineering-aplicado";
const moduleSlug = "modulo-01";

beforeEach(() => window.localStorage.clear());

describe("AI Engineering module progress", () => {
  it("keeps a visited unit in progress until the student confirms completion", () => {
    markAiEngineeringUnitInProgress(courseSlug, moduleSlug, "infografia");
    recordAiEngineeringLastUnit(courseSlug, moduleSlug, "infografia");

    const snapshot = readAiEngineeringModuleProgress(courseSlug, moduleSlug);
    expect(snapshot.statuses.infografia).toBe("in-progress");
    expect(snapshot.completedCount).toBe(0);
    expect(snapshot.percentage).toBe(0);
    expect(snapshot.lastUnitId).toBe("infografia");
  });

  it("derives activity and assessment completion from their existing records", () => {
    writeAiEngineeringUnitState(
      { courseSlug, moduleSlug, unitId: "actividad" },
      { response: "Mapa", completed: true },
    );
    writeAiEngineeringUnitState(
      { courseSlug, moduleSlug, unitId: "autoevaluacion" },
      { responses: { "respuesta-1": "Respuesta" }, reviewed: true },
    );

    const snapshot = readAiEngineeringModuleProgress(courseSlug, moduleSlug);
    expect(snapshot.statuses.actividad).toBe("completed");
    expect(snapshot.statuses.autoevaluacion).toBe("completed");
    expect(snapshot.completedCount).toBe(2);
    expect(snapshot.percentage).toBe(25);
  });

  it("records module completion only after all eight units are complete", () => {
    for (const unit of aiEngineeringProgressUnits) {
      if (unit.id === "actividad") {
        writeAiEngineeringUnitState(
          { courseSlug, moduleSlug, unitId: unit.id },
          { response: "Mapa", completed: true, status: "completed" },
        );
      } else if (unit.id === "autoevaluacion") {
        writeAiEngineeringUnitState(
          { courseSlug, moduleSlug, unitId: unit.id },
          { responses: {}, reviewed: true, status: "completed" },
        );
      } else {
        completeAiEngineeringStandardUnit(courseSlug, moduleSlug, unit.id);
      }
    }

    expect(readAiEngineeringModuleProgress(courseSlug, moduleSlug).percentage).toBe(100);
    const completedAt = ensureAiEngineeringModuleCompletion(courseSlug, moduleSlug);
    expect(completedAt).toEqual(expect.any(String));
    expect(ensureAiEngineeringModuleCompletion(courseSlug, moduleSlug)).toBe(completedAt);
    expect(readAiEngineeringModuleProgress(courseSlug, moduleSlug).completedAt).toBe(completedAt);
  });
});
