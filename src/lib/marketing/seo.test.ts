import { describe, expect, it } from "vitest";
import { buildCourseJsonLd, getCanonicalOrigin } from "./seo";

describe("marketing SEO", () => {
  it("normalizes the canonical origin", () => {
    expect(getCanonicalOrigin("https://academia.example/")).toBe("https://academia.example");
  });

  it("describes only verified course facts", () => {
    const jsonLd = buildCourseJsonLd("https://academia.example");

    expect(jsonLd["@type"]).toBe("Course");
    expect(jsonLd.isAccessibleForFree).toBe(true);
    expect(jsonLd.numberOfCredits).toBeUndefined();
    expect(jsonLd.aggregateRating).toBeUndefined();
    expect(jsonLd.provider).toMatchObject({
      "@type": "Organization",
      name: "Academia IA Educativa",
    });
  });
});
