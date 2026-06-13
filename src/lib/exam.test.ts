import { describe, expect, it } from "vitest";
import { courseSeed } from "@/lib/course-seed";
import { gradeExam, hasPassedExam, validateExamSeed } from "./exam";

describe("module exams", () => {
  it("ships exactly 20 questions per module", () => {
    const report = validateExamSeed(courseSeed);

    expect(report.moduleCount).toBe(11);
    expect(report.invalidModules).toEqual([]);
    expect(report.totalQuestions).toBe(220);
  });

  it("distributes correct answers across all four option positions", () => {
    for (const courseModule of courseSeed.modules) {
      const correctPositions = courseModule.examQuestions.map((question) =>
        question.options.findIndex((option) => option.id === question.correctOptionId),
      );

      expect(new Set(correctPositions)).toEqual(new Set([0, 1, 2, 3]));
      expect(correctPositions.filter((position) => position === 0)).toHaveLength(5);
      expect(correctPositions.filter((position) => position === 1)).toHaveLength(5);
      expect(correctPositions.filter((position) => position === 2)).toHaveLength(5);
      expect(correctPositions.filter((position) => position === 3)).toHaveLength(5);
    }
  });

  it("requires 80 percent to pass a module exam", () => {
    expect(hasPassedExam(15, 20)).toBe(false);
    expect(hasPassedExam(16, 20)).toBe(true);
    expect(hasPassedExam(20, 20)).toBe(true);
  });

  it("grades answers and exposes certificate eligibility", () => {
    const firstModule = courseSeed.modules[0];
    const answers = Object.fromEntries(
      firstModule.examQuestions.map((question, index) => [
        question.id,
        index < 16 ? question.correctOptionId : question.options.find((option) => option.id !== question.correctOptionId)?.id,
      ]),
    );

    const result = gradeExam(firstModule.examQuestions, answers);

    expect(result.correct).toBe(16);
    expect(result.incorrect).toBe(4);
    expect(result.percent).toBe(80);
    expect(result.passed).toBe(true);
  });
});
