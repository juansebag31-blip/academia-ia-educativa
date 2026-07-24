import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: mocks.exchangeCodeForSession,
    },
  })),
}));

describe("auth callback return destination", () => {
  beforeEach(() => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
  });

  it("returns a confirmed registration to AI Engineering", async () => {
    const response = await GET(new Request(
      "https://academia.example/auth/callback?code=test&next=%2Fcourses%2Fai-engineering-aplicado",
    ));

    expect(response.headers.get("location")).toBe(
      "https://academia.example/courses/ai-engineering-aplicado",
    );
  });

  it.each([
    "https%3A%2F%2Fexample.com",
    "%2F%2Fexample.com",
    "%5C%5Cexample.com",
  ])("rejects an external callback destination: %s", async (destination) => {
    const response = await GET(new Request(
      `https://academia.example/auth/callback?code=test&next=${destination}`,
    ));

    expect(response.headers.get("location")).toBe(
      "https://academia.example/account",
    );
  });

  it("preserves the safe context when code exchange fails", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({
      error: new Error("invalid code"),
    });
    const response = await GET(new Request(
      "https://academia.example/auth/callback?code=test&next=%2Fcourses%2Fai-engineering-aplicado&courseSlug=ai-engineering-aplicado",
    ));
    const location = new URL(response.headers.get("location") ?? "");

    expect(location.pathname).toBe("/auth/login");
    expect(location.searchParams.get("returnTo")).toBe(
      "/courses/ai-engineering-aplicado",
    );
    expect(location.searchParams.get("courseSlug")).toBe(
      "ai-engineering-aplicado",
    );
    expect(location.searchParams.get("error")).toBe(
      "No pudimos validar el enlace.",
    );
  });
});
