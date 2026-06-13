import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("import progress server action", () => {
  it("only exports async functions from the use server module", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/learning/import-actions.ts"),
      "utf8",
    );

    expect(source).not.toMatch(/export\s+(const|let|var|type|interface|class)\s+/);
    expect(source).toMatch(/export\s+async\s+function\s+importLearningProgress/);
  });
});
