import { beforeEach, describe, expect, it } from "vitest";
import {
  addLocalExamAttempt,
  getLocalLearningState,
  markLocalLessonCompleted,
  saveLocalModuleState,
} from "./local-learning-state";

describe("anonymous learning state", () => {
  beforeEach(() => window.localStorage.clear());

  it("stores completed lessons independently in the browser", () => {
    markLocalLessonCompleted("lesson-one");
    expect(getLocalLearningState().completedLessons).toHaveProperty("lesson-one");
  });

  it("stores module activities inside the importable package", () => {
    saveLocalModuleState("module-one", { notebook: { idea: "Mi reflexión" } });
    expect(getLocalLearningState().moduleStates["module-one"]).toEqual({
      notebook: { idea: "Mi reflexión" },
    });
  });

  it("keeps exam attempts with their module and answers", () => {
    addLocalExamAttempt({
      moduleSlug: "module-one",
      correct: 18,
      incorrect: 2,
      unanswered: 0,
      total: 20,
      percent: 90,
      passed: true,
      answers: { q1: "a" },
    });
    expect(getLocalLearningState().examAttempts[0]).toMatchObject({
      moduleSlug: "module-one",
      percent: 90,
      answers: { q1: "a" },
    });
  });
});
