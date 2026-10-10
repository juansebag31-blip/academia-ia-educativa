import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SidebarNavLinks, buildAssistantHref } from "./nav-links";

const navigation = vi.hoisted(() => ({ pathname: "/dashboard" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

describe("SidebarNavLinks assistant navigation", () => {
  beforeEach(() => {
    navigation.pathname = "/dashboard";
  });

  it("places the assistant immediately after Courses", () => {
    render(<SidebarNavLinks />);
    const links = screen.getAllByRole("link");

    expect(links[0]).toHaveTextContent("Cursos");
    expect(links[1]).toHaveTextContent("Asistente IA");
    expect(links[1]).toHaveAttribute(
      "href",
      "/courses/ia-educativa-notebooklm#asistente-ia",
    );
  });

  it("keeps the assistant link named when the sidebar is collapsed", () => {
    render(<SidebarNavLinks collapsed />);

    expect(screen.getByRole("link", { name: "Asistente IA" })).toHaveAttribute(
      "href",
      "/courses/ia-educativa-notebooklm#asistente-ia",
    );
  });

  it("targets the current module even from a nested module route", () => {
    navigation.pathname = "/courses/ia-educativa-notebooklm/modules/modulo-6-notebooklm-desde-cero/exam";
    render(<SidebarNavLinks />);

    expect(screen.getByRole("link", { name: "Asistente IA" })).toHaveAttribute(
      "href",
      "/courses/ia-educativa-notebooklm/modules/modulo-6-notebooklm-desde-cero#asistente-ia",
    );
  });

  it("targets the course assistant from lessons and unrelated standard sections", () => {
    expect(buildAssistantHref("/courses/ia-educativa-notebooklm/lessons/modulo-1-historia")).toBe(
      "/courses/ia-educativa-notebooklm#asistente-ia",
    );
    expect(buildAssistantHref("/courses/ai-engineering-aplicado/modules/modulo-1-introduccion")).toBe(
      "/courses/ia-educativa-notebooklm#asistente-ia",
    );
    expect(buildAssistantHref("/program")).toBe(
      "/courses/ia-educativa-notebooklm#asistente-ia",
    );
  });
});
