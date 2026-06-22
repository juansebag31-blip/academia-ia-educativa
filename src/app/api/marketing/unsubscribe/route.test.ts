import { afterEach, describe, expect, it, vi } from "vitest";
import { createUnsubscribeToken } from "@/lib/marketing/download-token";
import { handleUnsubscribe } from "./route";

const secret = "unsubscribe-test-secret";
const originalSecret = process.env.MARKETING_DOWNLOAD_SECRET;

afterEach(() => {
  process.env.MARKETING_DOWNLOAD_SECRET = originalSecret;
});

describe("newsletter unsubscribe", () => {
  it("unsubscribes a valid signed email and redirects to success", async () => {
    process.env.MARKETING_DOWNLOAD_SECRET = secret;
    const unsubscribe = vi.fn().mockResolvedValue(true);
    const token = createUnsubscribeToken("docente@example.com", secret);
    const response = await handleUnsubscribe(new Request(`http://localhost/api/marketing/unsubscribe?token=${token}`), { unsubscribe });

    expect(unsubscribe).toHaveBeenCalledWith("docente@example.com");
    expect(response.headers.get("location")).toBe("http://localhost/unsubscribe?status=success");
  });

  it("redirects invalid tokens without touching persistence", async () => {
    process.env.MARKETING_DOWNLOAD_SECRET = secret;
    const unsubscribe = vi.fn();
    const response = await handleUnsubscribe(new Request("http://localhost/api/marketing/unsubscribe?token=bad"), { unsubscribe });

    expect(unsubscribe).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("http://localhost/unsubscribe?status=invalid");
  });

  it("hides database failures behind a generic redirect", async () => {
    process.env.MARKETING_DOWNLOAD_SECRET = secret;
    const token = createUnsubscribeToken("docente@example.com", secret);
    const response = await handleUnsubscribe(new Request(`http://localhost/api/marketing/unsubscribe?token=${token}`), {
      unsubscribe: vi.fn().mockRejectedValue(new Error("database details")),
    });

    expect(response.headers.get("location")).toBe("http://localhost/unsubscribe?status=error");
  });
});
