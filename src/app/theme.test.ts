import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(process.cwd());
const tailwindConfig = readFileSync(resolve(root, "tailwind.config.ts"), "utf8");
const globalStyles = readFileSync(resolve(root, "src/app/globals.css"), "utf8");

describe("IA Cognitiva theme", () => {
  it("defines the approved course palette", () => {
    expect(tailwindConfig).toContain('ink: "#071A2B"');
    expect(tailwindConfig).toContain('ember: "#2563EB"');
    expect(tailwindConfig).toContain('"tech-cyan": "#06B6D4"');
    expect(tailwindConfig).toContain('"cognitive-violet": "#7C3AED"');
    expect(tailwindConfig).toContain('"paper-soft": "#F5F8FC"');
  });

  it("uses the cognitive palette for the page background and keyboard focus", () => {
    expect(globalStyles).toContain("--background: #f5f8fc");
    expect(globalStyles).toContain("outline-color: #06b6d4");
    expect(globalStyles).not.toContain("#ff4b16");
  });
});
