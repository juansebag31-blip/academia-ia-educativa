import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("marketing and course route separation", () => {
  it("keeps the root layout independent from the application shell", () => {
    const rootLayout = read("src/app/layout.tsx");

    expect(rootLayout).not.toContain("AppShell");
    expect(rootLayout).not.toContain("getCurrentUser");
  });

  it("mounts the educational shell in the app route group", () => {
    const appLayout = read("src/app/(app)/layout.tsx");

    expect(appLayout).toContain("<AppShell user={user}");
    expect(read("src/components/nav-links.tsx")).toContain('href: "/dashboard"');
  });
});
