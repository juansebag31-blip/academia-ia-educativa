export type MarketingEvent = "course_cta_click" | "newsletter_subscribed" | "prompt_kit_download";

export function trackMarketingEvent(event: MarketingEvent) {
  if (typeof window === "undefined") return;
  const target = window as Window & { dataLayer?: Array<{ event: MarketingEvent }> };
  target.dataLayer?.push({ event });
}
