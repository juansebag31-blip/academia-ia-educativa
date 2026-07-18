import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { resolveCourse } from "@/lib/courses/catalog";
import { AiEngineeringCases } from "./ai-engineering-cases";
import { AiEngineeringCourseOverview } from "./ai-engineering-course-overview";
import { AiEngineeringInfographic } from "./ai-engineering-infographic";
import { AiEngineeringLearningVisual } from "./ai-engineering-learning-visual";
import { AiEngineeringModulePage } from "./ai-engineering-module-page";
import { AiEngineeringPresentationViewer } from "./ai-engineering-presentation-viewer";

const course = resolveCourse("ai-engineering-aplicado");
if (!course || course.kind !== "ai-engineering") {
  throw new Error("AI Engineering fixture is unavailable.");
}
const moduleOne = course.modules[0];
const moduleTwo = course.modules.find(
  (module) => module.summary.slug === "modulo-02-modelos-fundacionales-seleccion",
);
if (!moduleTwo) {
  throw new Error("AI Engineering Module 2 fixture is unavailable.");
}
const moduleThree = course.modules.find(
  (module) => module.summary.slug === "modulo-03-contexto-estado-memoria",
);
if (!moduleThree) {
  throw new Error("AI Engineering Module 3 fixture is unavailable.");
}

describe("AI Engineering visual renderer", () => {
  it("renders declarative image visuals with their approved alternative text", () => {
    render(
      <AiEngineeringLearningVisual
        visual={{
          afterSection: "proposito",
          visualId: "visual-prueba-imagen",
          sourcePath: "assets/images/visual.png",
          publicPath: "/ai-engineering-assets/modulo-prueba/visuals/visual.png",
          alt: "Visual pedagógico de prueba",
          width: 1600,
          height: 900,
        }}
      />,
    );

    const opener = screen.getByRole("button", {
      name: "Ampliar visual pedagógico: Visual pedagógico de prueba",
    });
    expect(opener.tagName).toBe("BUTTON");
    const image = screen.getByRole("img", { name: "Visual pedagógico de prueba" });
    expect(image).toHaveAttribute("width", "1600");
    expect(image).toHaveAttribute("height", "900");

    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Visual pedagógico ampliado" });
    expect(within(dialog).getByRole("img", { name: "Visual pedagógico de prueba" })).toHaveClass("object-contain");
    const closeButton = within(dialog).getByRole("button", { name: "Cerrar" });
    expect(closeButton).toHaveFocus();
    expect(document.body).toHaveStyle({ overflow: "hidden" });

    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(closeButton).toHaveFocus();
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Visual pedagógico ampliado" })).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(document.body).not.toHaveStyle({ overflow: "hidden" });
  });

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
    expect(screen.getAllByText("Disponible")).toHaveLength(3);
    expect(screen.getAllByText("Próximamente")).toHaveLength(9);
    expect(screen.getByText("Modelos fundacionales y selección")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /02 Disponible Módulo 2 Modelos fundacionales y selección/ })).toHaveAttribute(
      "href",
      "/courses/ai-engineering-aplicado/modules/modulo-02-modelos-fundacionales-seleccion",
    );
    expect(screen.getByRole("link", { name: /03 Disponible Módulo 3 Contexto, estado y memoria/ })).toHaveAttribute(
      "href",
      "/courses/ai-engineering-aplicado/modules/modulo-03-contexto-estado-memoria",
    );
    expect(screen.getByText("Producción y proyecto final")).toBeInTheDocument();
    expect(screen.getByText("JSG AI Engineering Hub v0.1")).toBeInTheDocument();
    expect(screen.queryByText("Ruta pedagógica")).not.toBeInTheDocument();
  });

  it("renders Module 2 from its manifest-derived quantities", () => {
    const { container } = render(<AiEngineeringModulePage course={course} module={moduleTwo} />);

    expect(screen.getAllByRole("heading", { level: 1, name: "Modelos fundacionales y selección" })[0])
      .toBeInTheDocument();
    expect(moduleTwo.configuration.progressUnits).toHaveLength(8);
    expect(moduleTwo.content.cases).toHaveLength(3);
    expect(moduleTwo.presentation.slides).toHaveLength(
      moduleTwo.configuration.assets.presentation.slideCount,
    );
    expect(moduleTwo.visuals).toHaveLength(5);
    expect(moduleTwo.keyIdeas).toHaveLength(3);
    expect(screen.getAllByLabelText(/Respuesta \d/)).toHaveLength(10);
    expect(screen.getAllByRole("button", { name: /Ampliar visual pedagógico/ })).toHaveLength(5);
    expect(screen.getByRole("link", { name: "Descargar PPTX" })).toHaveAttribute(
      "href",
      moduleTwo.assets.presentation.publicPath,
    );
    expect(container.querySelector("audio")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {
      name: `Cargar y reproducir audio: ${moduleTwo.configuration.assets.audio.title}`,
    }));
    expect(container.querySelector("audio source")).toHaveAttribute("src", moduleTwo.assets.audioMp3.publicPath);
  });

  it("renders Module 3 from its manifest-derived quantities", () => {
    const { container } = render(<AiEngineeringModulePage course={course} module={moduleThree} />);

    expect(screen.getAllByRole("heading", { level: 1, name: "Contexto, estado y memoria" })[0])
      .toBeInTheDocument();
    expect(moduleThree.configuration.progressUnits).toHaveLength(8);
    expect(moduleThree.content.cases).toHaveLength(3);
    expect(moduleThree.presentation.slides).toHaveLength(15);
    expect(moduleThree.visuals).toHaveLength(5);
    expect(moduleThree.keyIdeas).toHaveLength(3);
    expect(screen.getAllByLabelText(/Respuesta \d/)).toHaveLength(12);
    expect(screen.getAllByRole("button", { name: /Ampliar visual pedagógico/ })).toHaveLength(5);
    expect(screen.getByRole("link", { name: "Descargar PPTX" })).toHaveAttribute(
      "href",
      moduleThree.assets.presentation.publicPath,
    );
    expect(container.querySelector("audio")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {
      name: `Cargar y reproducir audio: ${moduleThree.configuration.assets.audio.title}`,
    }));
    expect(container.querySelector("audio source")).toHaveAttribute("src", moduleThree.assets.audioMp3.publicPath);
  });

  it("renders the complete module structure and approved assets", () => {
    const { container } = render(<AiEngineeringModulePage course={course} module={moduleOne} />);

    const navigation = screen.getByRole("navigation", { name: "Navegación interna del módulo", hidden: true });
    expect(within(navigation).getAllByRole("link", { hidden: true })).toHaveLength(8);
    expect(within(navigation).getByRole("link", { name: /^08 Autoevaluación/, hidden: true })).toHaveAttribute(
      "href",
      "#autoevaluacion",
    );
    expect(screen.getByText("Recorrido del módulo · 8 etapas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Comenzar módulo" })).toHaveAttribute("href", "#contenido");
    expect(screen.queryByText("approved-content-ready-for-integration")).not.toBeInTheDocument();
    expect(container.querySelectorAll("#contenido article")).toHaveLength(12);
    expect(screen.getByText(/Mapa de un proceso real/i)).toBeInTheDocument();
    expect(screen.getByText(/Anthropic.*Building effective agents/i)).toBeInTheDocument();
    expect(screen.getAllByText("Síntesis visual")).toHaveLength(5);
    expect(screen.getAllByText("Idea esencial")).toHaveLength(3);
    expect(moduleOne.visuals.map((visual) => visual.afterSection)).toEqual([
      "aplicacion",
      "agente",
      "componentes",
      "complejidad",
      "caso",
    ]);
    expect(screen.getByRole("link", { name: "Descargar PPTX" })).toHaveAttribute(
      "href",
      moduleOne.assets.presentation.publicPath,
    );
    expect(screen.getByLabelText("Tu respuesta")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Respuesta \d/)).toHaveLength(8);
    expect(container.querySelector("audio")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", {
      name: "Cargar y reproducir audio: Audio explicativo del Módulo 1",
    }));
    expect(container.querySelector("audio source")).toHaveAttribute("src", moduleOne.assets.audioMp3.publicPath);
  });

  it("opens the 17-slide presentation and supports controls, keyboard and fullscreen", () => {
    const presentation = moduleOne.presentation;

    render(
      <AiEngineeringPresentationViewer
        presentation={presentation}
        downloadHref={moduleOne.assets.presentation.publicPath}
        courseSlug={course.summary.slug}
        moduleSlug={moduleOne.summary.slug}
        moduleNumber={moduleOne.summary.order}
        unitId="presentacion"
      />,
    );

    expect(presentation.slides).toHaveLength(17);
    fireEvent.click(screen.getByRole("button", { name: "Abrir presentación" }));
    expect(screen.getByText("Diapositiva 1 de 17")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("alt", presentation.slides[0].alt);
    expect(screen.getByRole("button", { name: "Diapositiva anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Diapositiva siguiente" })).toBeEnabled();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("Diapositiva 2 de 17")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("alt", presentation.slides[1].alt);

    fireEvent.click(screen.getByRole("button", { name: "Abrir en pantalla completa" }));
    expect(screen.getByRole("dialog", { name: "Presentación en pantalla completa" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Presentación en pantalla completa" })).not.toBeInTheDocument();
    expect(screen.getByText("Diapositiva 2 de 17")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("Diapositiva 2 de 17")).not.toBeInTheDocument();
  });

  it("opens the infographic, traps it as a dialog and closes with Escape", () => {
    render(
      <AiEngineeringInfographic
        src={moduleOne.assets.infographic.publicPath}
        alt="Infografía de prueba"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ver a pantalla completa: Infografía de prueba" }));
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
