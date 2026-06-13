import { describe, expect, it } from "vitest";
import { validateImportPayload } from "./import-payload";

describe("learning import payload", () => {
  it("accepts the versioned anonymous state", () => {
    const result = validateImportPayload({
      version: 1,
      completedLessons: { lesson: "2026-06-13T10:00:00.000Z" },
      moduleStates: { module: { notebook: { idea: "texto" } } },
      examAttempts: [],
    });
    expect(result.ok).toBe(true);
  });

  it("rejects unknown versions and oversized payloads", () => {
    expect(validateImportPayload({ version: 2 }).ok).toBe(false);
    expect(
      validateImportPayload({
        version: 1,
        completedLessons: {},
        moduleStates: { module: "x".repeat(250_001) },
        examAttempts: [],
      }).ok,
    ).toBe(false);
  });
});
