import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_COURSE_HREF,
  getAiEngineeringModuleNumber,
  isAiEngineeringCoursePath,
} from "./routes";

describe("AI Engineering contextual routes", () => {
  it("isolates only the AI Engineering course and its modules", () => {
    expect(isAiEngineeringCoursePath(AI_ENGINEERING_COURSE_HREF)).toBe(true);
    expect(isAiEngineeringCoursePath(`${AI_ENGINEERING_COURSE_HREF}/modules/modulo-06-workflows-automatizacion`)).toBe(true);
    expect(isAiEngineeringCoursePath("/courses/notebooklm")).toBe(false);
    expect(isAiEngineeringCoursePath("/dashboard")).toBe(false);
  });

  it("derives module numbers without changing public slugs", () => {
    expect(getAiEngineeringModuleNumber(`${AI_ENGINEERING_COURSE_HREF}/modules/modulo-01`)).toBe(1);
    expect(getAiEngineeringModuleNumber(`${AI_ENGINEERING_COURSE_HREF}/modules/modulo-12-produccion-proyecto-final`)).toBe(12);
    expect(getAiEngineeringModuleNumber(AI_ENGINEERING_COURSE_HREF)).toBeUndefined();
  });
});
