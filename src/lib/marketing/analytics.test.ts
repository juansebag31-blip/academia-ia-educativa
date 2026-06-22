import { afterEach, describe, expect, it } from "vitest";
import { trackMarketingEvent } from "./analytics";

afterEach(() => {
  delete (window as Window & { dataLayer?: unknown[] }).dataLayer;
});

describe("marketing analytics", () => {
  it("does nothing when no provider is configured", () => {
    expect(() => trackMarketingEvent("course_cta_click")).not.toThrow();
  });

  it("pushes only supported conversion events to dataLayer", () => {
    const target = window as Window & { dataLayer: unknown[] };
    target.dataLayer = [];

    trackMarketingEvent("newsletter_subscribed");

    expect(target.dataLayer).toEqual([{ event: "newsletter_subscribed" }]);
  });
});
