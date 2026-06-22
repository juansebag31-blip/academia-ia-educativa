import { afterEach, describe, expect, it } from "vitest";
import { GET } from "./route";
import { createDownloadToken } from "@/lib/marketing/download-token";

const secret = "test-download-secret";
const originalSecret = process.env.MARKETING_DOWNLOAD_SECRET;

afterEach(() => {
  process.env.MARKETING_DOWNLOAD_SECRET = originalSecret;
});

describe("prompt kit download", () => {
  it("returns the PDF for a valid signed token", async () => {
    process.env.MARKETING_DOWNLOAD_SECRET = secret;
    const issuedAt = Math.floor(Date.now() / 1000);
    const token = createDownloadToken("docente@example.com", secret, issuedAt);
    const response = await GET(new Request(`http://localhost/api/marketing/kit?token=${token}`));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain("kit-prompts-ia-educativa.pdf");
  });

  it("rejects missing and tampered tokens", async () => {
    process.env.MARKETING_DOWNLOAD_SECRET = secret;
    const token = createDownloadToken("docente@example.com", secret);

    expect((await GET(new Request("http://localhost/api/marketing/kit"))).status).toBe(403);
    expect((await GET(new Request(`http://localhost/api/marketing/kit?token=${token}x`))).status).toBe(403);
  });
});
