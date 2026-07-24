import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./login/page";
import RegisterPage from "./register/page";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

const returnTo = "/courses/ai-engineering-aplicado";
const courseSlug = "ai-engineering-aplicado";

describe("contextual auth pages", () => {
  beforeEach(() => {
    mocks.getCurrentUser.mockResolvedValue(null);
    mocks.redirect.mockImplementation((destination: string) => {
      throw new Error(`REDIRECT:${destination}`);
    });
  });

  it("preserves and displays AI Engineering across login and cancellation", async () => {
    const login = await LoginPage({
      searchParams: Promise.resolve({ returnTo, courseSlug }),
    });
    const { container } = render(login);

    expect(screen.getByText("AI Engineering Aplicado")).toBeInTheDocument();
    expect(screen.getByText(/iniciando sesión para continuar/i)).toBeInTheDocument();
    expect(screen.getByRole("link", {
      name: "Volver a la portada de AI Engineering Aplicado",
    })).toHaveAttribute("href", returnTo);
    expect(container.querySelector('input[name="returnTo"]')).toHaveValue(returnTo);
    expect(container.querySelector('input[name="courseSlug"]')).toHaveValue(courseSlug);
    expect(screen.getByRole("link", { name: "Regístrate gratis" })).toHaveAttribute(
      "href",
      "/auth/register?returnTo=%2Fcourses%2Fai-engineering-aplicado&courseSlug=ai-engineering-aplicado",
    );
    expect(screen.getByRole("link", { name: "Continuar como visitante" })).toHaveAttribute(
      "href",
      returnTo,
    );
  });

  it("preserves and displays AI Engineering across registration", async () => {
    const registration = await RegisterPage({
      searchParams: Promise.resolve({ returnTo, courseSlug }),
    });
    const { container } = render(registration);

    expect(screen.getByText("AI Engineering Aplicado")).toBeInTheDocument();
    expect(screen.getByText(/creando una cuenta para guardar tu progreso/i)).toBeInTheDocument();
    expect(container.querySelector('input[name="returnTo"]')).toHaveValue(returnTo);
    expect(container.querySelector('input[name="courseSlug"]')).toHaveValue(courseSlug);
    expect(screen.getByRole("link", { name: "Inicia sesión" })).toHaveAttribute(
      "href",
      "/auth/login?returnTo=%2Fcourses%2Fai-engineering-aplicado&courseSlug=ai-engineering-aplicado",
    );
    expect(screen.getByRole("link", { name: "Continuar como visitante" })).toHaveAttribute(
      "href",
      returnTo,
    );
  });

  it("returns an authenticated user directly to AI Engineering", async () => {
    mocks.getCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "juan@example.com",
      displayName: "Juan",
      initials: "J",
    });

    await expect(LoginPage({
      searchParams: Promise.resolve({ returnTo, courseSlug }),
    })).rejects.toThrow(`REDIRECT:${returnTo}`);
    expect(mocks.redirect).toHaveBeenCalledWith(returnTo);
  });

  it("does not propagate an external returnTo value or a detached course slug", async () => {
    const login = await LoginPage({
      searchParams: Promise.resolve({
        returnTo: "//example.com",
        courseSlug,
      }),
    });
    const { container } = render(login);

    expect(container.querySelector('input[name="returnTo"]')).toHaveValue("");
    expect(container.querySelector('input[name="courseSlug"]')).toHaveValue("");
    expect(screen.getByRole("link", { name: "Continuar como visitante" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Regístrate gratis" })).toHaveAttribute(
      "href",
      "/auth/register",
    );
    expect(screen.queryByText("AI Engineering Aplicado")).not.toBeInTheDocument();
  });

  it("keeps generic login visually unchanged without course context", async () => {
    const login = await LoginPage({
      searchParams: Promise.resolve({}),
    });
    render(login);

    expect(screen.queryByText("AI Engineering Aplicado")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuar como visitante" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
