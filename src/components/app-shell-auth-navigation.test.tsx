import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

const navigation = vi.hoisted(() => ({
  pathname: "/auth/login",
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => navigation.searchParams,
}));

describe("application shell authentication navigation", () => {
  beforeEach(() => {
    navigation.pathname = "/auth/login";
    navigation.searchParams = new URLSearchParams();
  });

  it("uses the AI Engineering shell while preserving its auth context", () => {
    navigation.searchParams = new URLSearchParams({
      returnTo: "/courses/ai-engineering-aplicado",
      courseSlug: "ai-engineering-aplicado",
    });

    render(<AppShell user={null}>Contenido</AppShell>);

    expect(screen.getByRole("complementary", {
      name: "Navegación de AI Engineering",
    })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Migas de pan" })).toHaveTextContent("Acceso");
    expect(screen.queryByText("La revolución del conocimiento")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/auth/login?returnTo=%2Fcourses%2Fai-engineering-aplicado&courseSlug=ai-engineering-aplicado",
    );
    expect(screen.getByRole("link", { name: "Registrarse" })).toHaveAttribute(
      "href",
      "/auth/register?returnTo=%2Fcourses%2Fai-engineering-aplicado&courseSlug=ai-engineering-aplicado",
    );
  });

  it("labels contextual registration in the course breadcrumb", () => {
    navigation.pathname = "/auth/register";
    navigation.searchParams = new URLSearchParams({
      returnTo: "/courses/ai-engineering-aplicado",
      courseSlug: "ai-engineering-aplicado",
    });

    render(<AppShell user={null}>Contenido</AppShell>);

    expect(screen.getByRole("navigation", { name: "Migas de pan" })).toHaveTextContent("Registro");
  });

  it("keeps the original generic auth navigation unchanged without context", () => {
    render(<AppShell user={null}>Contenido</AppShell>);

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/auth/login");
    expect(screen.getByRole("link", { name: "Registrarse" })).toHaveAttribute("href", "/auth/register");
    expect(screen.queryByRole("complementary", {
      name: "Navegación de AI Engineering",
    })).not.toBeInTheDocument();
  });

  it("does not apply course context to an external return destination", () => {
    navigation.searchParams = new URLSearchParams({
      returnTo: "//example.com/account",
      courseSlug: "ai-engineering-aplicado",
    });

    render(<AppShell user={null}>Contenido</AppShell>);

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/auth/login");
    expect(screen.getByRole("link", { name: "Registrarse" })).toHaveAttribute("href", "/auth/register");
    expect(screen.queryByRole("complementary", {
      name: "Navegación de AI Engineering",
    })).not.toBeInTheDocument();
  });
});
