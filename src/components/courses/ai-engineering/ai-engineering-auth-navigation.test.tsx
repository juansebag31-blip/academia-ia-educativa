import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AiEngineeringAppShell } from "./ai-engineering-app-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/courses/ai-engineering-aplicado",
}));

describe("AI Engineering authentication navigation", () => {
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
});
