import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginAction, registerAction } from "./actions";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: (name: string) => name === "origin" ? "https://academia.example" : null,
  })),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
    },
  })),
}));

const returnTo = "/courses/ai-engineering-aplicado";
const courseSlug = "ai-engineering-aplicado";

function redirectError(destination: string) {
  return new Error(`REDIRECT:${destination}`);
}

function loginForm(destination?: string) {
  const formData = new FormData();
  formData.set("email", "juan@example.com");
  formData.set("password", "segura123");
  if (destination !== undefined) formData.set("returnTo", destination);
  return formData;
}

function registrationForm() {
  const formData = new FormData();
  formData.set("displayName", "Juan");
  formData.set("email", "juan@example.com");
  formData.set("password", "segura123");
  formData.set("confirmPassword", "segura123");
  formData.set("returnTo", returnTo);
  formData.set("courseSlug", courseSlug);
  return formData;
}

function mismatchedRegistrationForm() {
  const formData = registrationForm();
  formData.set("returnTo", "/account");
  return formData;
}

describe("contextual auth actions", () => {
  beforeEach(() => {
    mocks.redirect.mockImplementation((destination: string) => {
      throw redirectError(destination);
    });
    mocks.signInWithPassword.mockResolvedValue({ error: null });
    mocks.signUp.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it("returns a successful AI Engineering login to its course", async () => {
    await expect(loginAction(loginForm(returnTo))).rejects.toThrow(
      `REDIRECT:${returnTo}`,
    );
    expect(mocks.redirect).toHaveBeenCalledWith(returnTo);
    expect(mocks.redirect).not.toHaveBeenCalledWith("/program");
    expect(mocks.redirect).not.toHaveBeenCalledWith("/modules");
    expect(mocks.redirect).not.toHaveBeenCalledWith("/dashboard");
  });

  it("preserves the original login destination without contextual parameters", async () => {
    await expect(loginAction(loginForm())).rejects.toThrow("REDIRECT:/account");
    expect(mocks.redirect).toHaveBeenCalledWith("/account");
  });

  it("falls back to the account for an external login destination", async () => {
    await expect(loginAction(loginForm("//example.com"))).rejects.toThrow(
      "REDIRECT:/account",
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/account");
  });

  it("keeps the course in registration metadata, callback and confirmation login", async () => {
    await expect(registerAction(registrationForm())).rejects.toThrow(/^REDIRECT:\/auth\/login\?/);

    expect(mocks.signUp).toHaveBeenCalledWith(expect.objectContaining({
      options: {
        data: {
          display_name: "Juan",
          course_slug: courseSlug,
        },
        emailRedirectTo: expect.stringContaining(
          "/auth/callback?next=%2Fcourses%2Fai-engineering-aplicado&courseSlug=ai-engineering-aplicado",
        ),
      },
    }));
    expect(mocks.redirect).toHaveBeenCalledWith(expect.stringContaining(
      "returnTo=%2Fcourses%2Fai-engineering-aplicado",
    ));
    expect(mocks.redirect).toHaveBeenCalledWith(expect.stringContaining(
      "courseSlug=ai-engineering-aplicado",
    ));
  });

  it("returns immediately when registration creates an authenticated session", async () => {
    mocks.signUp.mockResolvedValue({
      data: { session: { access_token: "test" } },
      error: null,
    });

    await expect(registerAction(registrationForm())).rejects.toThrow(
      `REDIRECT:${returnTo}`,
    );
    expect(mocks.redirect).toHaveBeenCalledWith(returnTo);
  });

  it("does not associate AI Engineering metadata with a mismatched destination", async () => {
    await expect(registerAction(mismatchedRegistrationForm())).rejects.toThrow(
      /^REDIRECT:\/auth\/login\?/,
    );

    expect(mocks.signUp).toHaveBeenCalledWith(expect.objectContaining({
      options: {
        data: {
          display_name: "Juan",
        },
        emailRedirectTo: "https://academia.example/auth/callback?next=%2Faccount",
      },
    }));
  });
});
