import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { buildAiEngineeringUnitStorageKey } from "@/lib/courses/ai-engineering/unit-storage";
import { AiEngineeringActivity } from "./ai-engineering-activity";
import { AiEngineeringAudioPlayer } from "./ai-engineering-audio-player";
import { AiEngineeringSelfAssessment } from "./ai-engineering-self-assessment";

const courseSlug = "ai-engineering-aplicado";
const moduleSlug = "modulo-01";

beforeEach(() => {
  window.localStorage.clear();
});

describe("AI Engineering unit interactions", () => {
  it("builds isolated keys with course, module and unit identifiers", () => {
    expect(buildAiEngineeringUnitStorageKey({ courseSlug, moduleSlug, unitId: "actividad" })).toBe(
      "academia-ia-ai-engineering-unit-v1:ai-engineering-aplicado:modulo-01:actividad",
    );
  });

  it("auto-saves the activity, supports manual saving and restores later edits", async () => {
    const { unmount } = render(
      <AiEngineeringActivity
        courseSlug={courseSlug}
        moduleSlug={moduleSlug}
        sourceHtml="<h2>Actividad práctica</h2>"
        unitId="actividad"
        responseLabel="Tu respuesta"
        placeholder="Escribe aquí tu mapa del proceso y justificación arquitectónica."
      />,
    );
    const response = screen.getByLabelText("Tu respuesta");
    fireEvent.change(response, { target: { value: "Mi mapa del proceso" } });
    expect(screen.getByRole("status")).toHaveTextContent("Cambios pendientes");

    const key = buildAiEngineeringUnitStorageKey({ courseSlug, moduleSlug, unitId: "actividad" });
    await waitFor(() => expect(window.localStorage.getItem(key)).toContain("Mi mapa del proceso"), {
      timeout: 2000,
    });
    expect(screen.getByRole("status")).toHaveTextContent("Guardado");

    fireEvent.click(screen.getByRole("button", { name: "Guardar respuesta" }));
    fireEvent.click(screen.getByRole("button", { name: "Marcar actividad como terminada" }));
    expect(window.localStorage.getItem(key)).toContain('"completed":true');

    unmount();
    render(
      <AiEngineeringActivity
        courseSlug={courseSlug}
        moduleSlug={moduleSlug}
        sourceHtml="<h2>Actividad práctica</h2>"
        unitId="actividad"
        responseLabel="Tu respuesta"
        placeholder="Escribe aquí tu mapa del proceso y justificación arquitectónica."
      />,
    );
    await waitFor(() => expect(screen.getByLabelText("Tu respuesta")).toHaveValue("Mi mapa del proceso"));
  });

  it("stores eight editable self-assessment responses without scores", async () => {
    render(
      <AiEngineeringSelfAssessment
        courseSlug={courseSlug}
        moduleSlug={moduleSlug}
        sourceHtml="<h2>Autoevaluación</h2>"
        unitId="autoevaluacion"
        questionCount={3}
      />,
    );

    expect(screen.getAllByLabelText(/Respuesta \d/)).toHaveLength(3);
    fireEvent.change(screen.getByLabelText("Respuesta 1"), {
      target: { value: "Una aplicación incorpora control y contexto." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar respuestas" }));
    fireEvent.click(screen.getByRole("button", { name: "He revisado mis respuestas" }));

    const key = buildAiEngineeringUnitStorageKey({ courseSlug, moduleSlug, unitId: "autoevaluacion" });
    await waitFor(() => {
      expect(window.localStorage.getItem(key)).toContain("Una aplicación incorpora control y contexto.");
      expect(window.localStorage.getItem(key)).toContain('"reviewed":true');
    });
    expect(screen.getByText(/No hay puntuación/i)).toBeInTheDocument();
  });

  it("stores and restores the audio position without changing completion", async () => {
    const audioProps = {
      courseSlug,
      moduleSlug,
      src: "/audio-prueba.mp3",
      type: "audio/mpeg",
      title: "Audio de prueba",
      unitId: "audio_explicativo",
    };
    const { container, unmount } = render(<AiEngineeringAudioPlayer {...audioProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Cargar y reproducir audio: Audio de prueba" }));
    const audio = container.querySelector("audio");
    if (!audio) throw new Error("The audio element was not rendered.");
    Object.defineProperty(audio, "currentTime", { configurable: true, value: 12 });
    fireEvent.timeUpdate(audio);

    const key = buildAiEngineeringUnitStorageKey({
      courseSlug,
      moduleSlug,
      unitId: "audio_explicativo",
    });
    expect(window.localStorage.getItem(key)).toContain('"positionSeconds":12');
    expect(window.localStorage.getItem(key)).toContain('"status":"in-progress"');

    unmount();
    render(<AiEngineeringAudioPlayer {...audioProps} />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Continuar audio: Audio de prueba" })).toBeInTheDocument();
    });
  });
});
