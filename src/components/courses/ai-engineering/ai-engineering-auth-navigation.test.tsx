import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AiEngineeringAppShell } from "./ai-engineering-app-shell";

const navigationMock = vi.hoisted(() => ({
  pathname: "/courses/ai-engineering-aplicado",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMock.pathname,
}));

describe("AI Engineering authentication navigation", () => {
  beforeEach(() => {
    navigationMock.pathname = "/courses/ai-engineering-aplicado";
    window.history.replaceState(null, "", "/courses/ai-engineering-aplicado");
  });

  it("keeps login and registration tied to AI Engineering for visitors", () => {
    render(
      <AiEngineeringAppShell user={null}>
        <p>Contenido del curso</p>
      </AiEngineeringAppShell>,
    );

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/auth/login?returnTo=%2Fcourses%2Fai-engineering-aplicado&courseSlug=ai-engineering-aplicado",
    );
    expect(screen.getByRole("link", { name: "Registrarse" })).toHaveAttribute(
      "href",
      "/auth/register?returnTo=%2Fcourses%2Fai-engineering-aplicado&courseSlug=ai-engineering-aplicado",
    );
  });

  it("shows the account state instead of auth links for an authenticated user", () => {
    render(
      <AiEngineeringAppShell
        user={{
          id: "user-1",
          email: "juan@example.com",
          displayName: "Juan",
          initials: "J",
        }}
      >
        <p>Contenido del curso</p>
      </AiEngineeringAppShell>,
    );

    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Registrarse" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Juan/ })).toHaveAttribute("href", "/account");
    expect(document.querySelector('a[href*="ia-educativa-notebooklm"]')).toBeNull();
  });

  it("updates the highlighted course section immediately when a navigation link is selected", () => {
    render(
      <AiEngineeringAppShell user={null}>
        <p>Contenido del curso</p>
      </AiEngineeringAppShell>,
    );

    const coverLink = screen.getByRole("link", { name: "Portada" });
    const resultsLink = screen.getByRole("link", { name: "Resultados" });
    const architectureLink = screen.getByRole("link", { name: "Arquitectura" });
    resultsLink.addEventListener("click", (event) => event.preventDefault());
    architectureLink.addEventListener("click", (event) => event.preventDefault());

    expect(coverLink).toHaveAttribute("aria-current", "page");

    fireEvent.click(resultsLink);
    expect(resultsLink).toHaveAttribute("aria-current", "location");
    expect(coverLink).not.toHaveAttribute("aria-current");

    fireEvent.click(architectureLink);
    expect(architectureLink).toHaveAttribute("aria-current", "location");
    expect(resultsLink).not.toHaveAttribute("aria-current");
  });

  it("tracks the visible course section while the page scrolls", async () => {
    const positions: Record<string, number> = {
      portada: -800,
      resultados: -300,
      arquitectura: 500,
      proyecto: 900,
      programa: 1300,
    };
    const rectSpy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
      const top = positions[this.id] ?? 1000;
      return {
        x: 0,
        y: top,
        top,
        left: 0,
        right: 1000,
        bottom: top + 500,
        width: 1000,
        height: 500,
        toJSON: () => ({}),
      };
    });

    render(
      <AiEngineeringAppShell user={null}>
        <section id="portada" />
        <section id="resultados" />
        <section id="arquitectura" />
        <section id="proyecto" />
        <section id="programa" />
      </AiEngineeringAppShell>,
    );

    fireEvent.scroll(window);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Resultados" })).toHaveAttribute("aria-current", "location");
    });

    positions.arquitectura = 100;
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Arquitectura" })).toHaveAttribute("aria-current", "location");
    });

    positions.proyecto = -500;
    positions.programa = 300;
    window.history.replaceState(null, "", "/courses/ai-engineering-aplicado#programa");
    fireEvent(window, new Event("hashchange"));

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "12 módulos" })).toHaveAttribute("aria-current", "location");
    });

    rectSpy.mockRestore();
  });
});
