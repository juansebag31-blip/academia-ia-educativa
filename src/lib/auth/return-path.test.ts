import { describe, expect, it } from "vitest";
import {
  buildAuthHref,
  getAuthCourseContext,
  getSafeAuthCourseSlug,
  getSafeInternalReturnTo,
} from "./return-path";

describe("auth return paths", () => {
  it("preserves an internal AI Engineering destination", () => {
    expect(getSafeInternalReturnTo("/courses/ai-engineering-aplicado")).toBe(
      "/courses/ai-engineering-aplicado",
    );
    expect(buildAuthHref("/auth/login", {
      returnTo: "/courses/ai-engineering-aplicado",
    })).toBe(
      "/auth/login?returnTo=%2Fcourses%2Fai-engineering-aplicado",
    );
  });

  it("preserves the AI Engineering course slug during registration", () => {
    expect(getSafeAuthCourseSlug("ai-engineering-aplicado")).toBe(
      "ai-engineering-aplicado",
    );
    expect(buildAuthHref("/auth/register", {
      returnTo: "/courses/ai-engineering-aplicado",
      courseSlug: "ai-engineering-aplicado",
    })).toBe(
      "/auth/register?returnTo=%2Fcourses%2Fai-engineering-aplicado&courseSlug=ai-engineering-aplicado",
    );
  });

  it("recognizes AI Engineering only when its destination and slug match", () => {
    expect(getAuthCourseContext(
      "/courses/ai-engineering-aplicado",
      "ai-engineering-aplicado",
    )).toEqual({
      courseSlug: "ai-engineering-aplicado",
      href: "/courses/ai-engineering-aplicado",
      title: "AI Engineering Aplicado",
    });
    expect(getAuthCourseContext("/account", "ai-engineering-aplicado")).toBeNull();
    expect(getAuthCourseContext(
      "/courses/ai-engineering-aplicado",
      "curso-original",
    )).toBeNull();
  });

  it.each([
    "https://example.com",
    "http://example.com",
    "//example.com",
    "/\\example.com",
    "\\\\example.com",
    "javascript:alert(1)",
  ])("rejects the external or ambiguous destination %s", (destination) => {
    expect(getSafeInternalReturnTo(destination)).toBeNull();
    expect(buildAuthHref("/auth/login", { returnTo: destination })).toBe("/auth/login");
  });

  it("keeps the original auth routes unchanged without context", () => {
    expect(buildAuthHref("/auth/login")).toBe("/auth/login");
    expect(buildAuthHref("/auth/register")).toBe("/auth/register");
  });
});
