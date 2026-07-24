import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { resolveCourse } from "@/lib/courses/catalog";
import { AiEngineeringModuleSequenceNavigation } from "./ai-engineering-module-sequence-navigation";

const resolvedCourse = resolveCourse("ai-engineering-aplicado");

if (!resolvedCourse || resolvedCourse.kind !== "ai-engineering") {
  throw new Error("AI Engineering course fixture is unavailable.");
}

const course = resolvedCourse;

function renderModule(order: number) {
  const currentModule = course.modules.find((candidate) => candidate.summary.order === order);
  if (!currentModule) throw new Error(`Missing module ${order}.`);
  render(<AiEngineeringModuleSequenceNavigation course={course} module={currentModule} />);
}

describe("AI Engineering sequential module navigation", () => {
  it("links module 1 to module 2 without showing a previous module", () => {
    renderModule(1);

    expect(screen.getByText("Este es el primer módulo del recorrido.")).toBeInTheDocument();
    expect(screen.getByRole("link", {
      name: "Siguiente módulo: Modelos fundacionales y selección",
    })).toHaveAttribute(
      "href",
      "/courses/ai-engineering-aplicado/modules/modulo-02-modelos-fundacionales-seleccion",
    );
  });

  it("derives the previous and next links for module 6 from the catalog", () => {
    renderModule(6);

    expect(screen.getByRole("link", {
      name: "Módulo anterior: RAG y sistemas de conocimiento",
    })).toHaveAttribute(
      "href",
      "/courses/ai-engineering-aplicado/modules/modulo-05-rag-sistemas-conocimiento",
    );
    expect(screen.getByRole("link", {
      name: "Siguiente módulo: Agentes y sistemas multiagente",
    })).toHaveAttribute(
      "href",
      "/courses/ai-engineering-aplicado/modules/modulo-07-agentes-sistemas-multiagente",
    );
  });

  it("links module 11 to the canonical module 12 route", () => {
    renderModule(11);

    expect(screen.getByRole("link", {
      name: "Siguiente módulo: Producción y proyecto final",
    })).toHaveAttribute(
      "href",
      "/courses/ai-engineering-aplicado/modules/modulo-12-produccion-proyecto-final",
    );
  });

  it("ends module 12 without inventing a module 13", () => {
    renderModule(12);

    expect(screen.getByRole("link", {
      name: "Módulo anterior: Producto y automatización empresarial",
    })).toHaveAttribute(
      "href",
      "/courses/ai-engineering-aplicado/modules/modulo-11-producto-automatizacion-empresarial",
    );
    expect(screen.getByRole("status")).toHaveTextContent("Curso completado");
    expect(document.body.innerHTML).not.toContain("modulo-13");
  });

  it("keeps navigation keyboard-focusable and leaves progress storage intact", () => {
    localStorage.setItem("ai-engineering-progress-test", "preserved");
    renderModule(6);
    const courseLink = screen.getByRole("link", { name: "Volver a la portada del curso" });

    courseLink.focus();
    expect(courseLink).toHaveFocus();
    courseLink.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(courseLink);
    expect(localStorage.getItem("ai-engineering-progress-test")).toBe("preserved");
  });
});
