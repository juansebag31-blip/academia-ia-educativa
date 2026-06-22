import { describe, expect, it, vi } from "vitest";
import { subscribeToNewsletter, validateNewsletterInput } from "./newsletter";

describe("newsletter validation", () => {
  it("normalizes valid consented subscriber input", () => {
    expect(validateNewsletterInput({ email: " Docente@Example.com ", name: " Ana ", consent: true, company: "" })).toEqual({
      ok: true,
      value: { email: "docente@example.com", name: "Ana", consent: true },
    });
  });

  it("rejects missing consent and honeypot submissions", () => {
    expect(validateNewsletterInput({ email: "a@b.com", name: "", consent: false, company: "" }).ok).toBe(false);
    expect(validateNewsletterInput({ email: "a@b.com", name: "", consent: true, company: "bot" }).ok).toBe(false);
  });
});

describe("newsletter subscription", () => {
  it("returns a signed download even when email delivery is unavailable", async () => {
    const upsertSubscriber = vi.fn().mockResolvedValue({ alreadySubscribed: false });
    const result = await subscribeToNewsletter(
      { email: "docente@example.com", name: "Ana", consent: true, company: "" },
      { origin: "127.0.0.1", userAgent: "test" },
      {
        consumeRateLimit: vi.fn().mockResolvedValue(true),
        upsertSubscriber,
        createDownloadUrl: () => "/api/marketing/kit?token=signed",
        createUnsubscribeUrl: () => "/api/marketing/unsubscribe?token=signed",
        sendEmail: vi.fn().mockResolvedValue(false),
      },
    );

    expect(result).toEqual({ status: "success", downloadUrl: "/api/marketing/kit?token=signed", emailSent: false });
    expect(upsertSubscriber).toHaveBeenCalledWith({ email: "docente@example.com", name: "Ana", consentedAt: expect.any(Date) });
  });

  it("stops before persistence when the origin is rate limited", async () => {
    const upsertSubscriber = vi.fn();
    const result = await subscribeToNewsletter(
      { email: "docente@example.com", name: "", consent: true, company: "" },
      { origin: "127.0.0.1", userAgent: "test" },
      {
        consumeRateLimit: vi.fn().mockResolvedValue(false),
        upsertSubscriber,
        createDownloadUrl: vi.fn(),
        createUnsubscribeUrl: vi.fn(),
        sendEmail: vi.fn(),
      },
    );

    expect(result.status).toBe("rate_limited");
    expect(upsertSubscriber).not.toHaveBeenCalled();
  });
});
