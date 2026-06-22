import { describe, expect, it } from "vitest";
import { createDownloadToken, verifyDownloadToken } from "./download-token";

describe("download tokens", () => {
  it("accepts current signed tokens and rejects tampering", () => {
    const token = createDownloadToken("docente@example.com", "secret", 1_800_000_000);

    expect(verifyDownloadToken(token, "secret", 1_800_000_001)).toBe("docente@example.com");
    expect(verifyDownloadToken(`${token}x`, "secret", 1_800_000_001)).toBeNull();
  });

  it("rejects expired tokens", () => {
    const token = createDownloadToken("docente@example.com", "secret", 1_800_000_000);

    expect(verifyDownloadToken(token, "secret", 1_800_086_401)).toBeNull();
  });
});
