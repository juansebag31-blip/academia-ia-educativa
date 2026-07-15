import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { resolveCourse } from "@/lib/courses/catalog";
import { AiEngineeringCases } from "./ai-engineering-cases";
import { AiEngineeringCourseOverview } from "./ai-engineering-course-overview";
import { AiEngineeringInfographic } from "./ai-engineering-infographic";
import { AiEngineeringModulePage } from "./ai-engineering-module-page";

const course = resolveCourse("ai-engineering-aplicado");
if (!course || course.kind !== "ai-engineering") {
  throw new Error("AI Engineering fixture is unavailable.");
}
const moduleOne = course.modules[0];

describe("AI Engineering visual renderer", () => {
  it("renders the course cover from the multicourse catalog", () => {
    render(<AiEngineeringCourseOverview course={course} />);

    expect(screen.getByRole("heading", { level: 1, name: "AI Engineering Aplicado" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Comenzar Módulo 1" })).toHaveAttribute(
      "href",
      "/courses/ai-engineering-aplicado/modules/modulo-01",
    );
    expect(screen.getByText("Arquitectura de un sistema inteligente")).toBeInTheDocument();
    expect(screen.getByText("Modelo / RAG / Herramientas")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getAllByText("Disponible")).toHaveLength(1);
    expect(screen.getAllByText("Próximamente")).toHaveLength(11);
    expect(screen.getByText("JSG AI Engineering Hub v0.1")).toBeInTheDocument();
    expect(screen.queryByText("Ruta pedagógica")).not.toBeInTheDocument();
  });

  it("renders the complete module structure and approved assets", () => {
    const { container } = render(<AiEngineeringModulePage course={course} module={moduleOne} />);

    const navigation = screen.getByRole("navigation", { name: "Navegación interna del módulo", hidden: true });
    expect(within(navigation).getAllByRole("link", { hidden: true })).toHaveLength(8);
    expect(within(navigation).getByRole("link", { name: "07 Autoevaluación", hidden: true })).toHaveAttribute(
      "href",
      "#autoevaluacion",
    );
    expect(screen.getByText("Recorrido del módulo · 8 etapas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Comenzar módulo" })).toHaveAttribute("href", "#contenido");
    expect(screen.queryByText("approved-content-ready-for-integration")).not.toBeInTheDocument();
    expect(container.querySelectorAll("#contenido article")).toHaveLength(12);
    expect(screen.getByText(/Mapa de un proceso real/i)).toBeInTheDocument();
    expect(screen.getByText(/Anthropic.*Building effective agents/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Descargar PPTX" })).toHaveAttribute(
      "href",
      moduleOne.assets.presentation.publicPath,
    );
    expect(screen.getByLabelText("Tu respuesta")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Respuesta \d/)).toHaveLength(8);
    expect(container.querySelector("audio")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reproducir Audio explicativo del Módulo 1" }));
    expect(container.querySelector("audio source")).toHaveAttribute("src", moduleOne.assets.audioMp3.publicPath);
  });

  it("opens the infographic, traps it as a dialog and closes with Escape", () => {
    render(
      <AiEngineeringInfographic
        src={moduleOne.assets.infographic.publicPath}
        alt="Infografía de prueba"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ampliar infografía a pantalla completa" }));
    const dialog = screen.getByRole("dialog", { name: "Infografía ampliada" });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Descargar" })).toHaveAttribute("download");

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Infografía ampliada" })).not.toBeInTheDocument();
  });

  it("supports arrow-key navigation across desktop case tabs", () => {
    render(<AiEngineeringCases cases={moduleOne.content.cases} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveFocus();

    fireEvent.keyDown(tabs[1], { key: "End" });
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
  });
});
