import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AssistantChat } from "./assistant-chat";

const fetchMock = vi.fn<typeof fetch>();

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("AssistantChat", () => {
  it("disables the form and announces loading while the request is pending", async () => {
    fetchMock.mockReturnValue(new Promise<Response>(() => undefined));
    vi.stubGlobal("fetch", fetchMock);

    render(<AssistantChat courseSlug="ia-educativa-notebooklm" />);
    expect(screen.getByRole("region", { name: "Asistente IA del curso" })).toHaveAttribute("id", "asistente-ia");
    expect(screen.getByText(/Consultá cualquiera de los 11 módulos/)).toBeInTheDocument();
    expect(screen.getByText(/Respuestas basadas en los materiales del curso/)).toBeInTheDocument();
    const field = screen.getByLabelText("Escribe tu pregunta");
    fireEvent.change(field, { target: { value: "¿Qué es NotebookLM?" } });
    fireEvent.click(screen.getByRole("button", { name: "Preguntar al Asistente IA" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Consultando fuentes…" })).toBeDisabled();
    });
    expect(field).toBeDisabled();
  });

  it("sends course and module context and renders traceable sources", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      status: "answered",
      answer: "NotebookLM trabaja con las fuentes seleccionadas [S1].",
      sources: [{
        id: "S1",
        moduleNumber: 6,
        moduleTitle: "Módulo 6 - NotebookLM",
        sectionTitle: "Qué es NotebookLM",
        subsectionTitle: "Trabajo con fuentes",
        pageStart: 3,
        pageEnd: 4,
        routePath: "/courses/ia-educativa-notebooklm/modules/modulo-6",
        similarity: 0.91,
      }],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    render(<AssistantChat courseSlug="ia-educativa-notebooklm" moduleSlug="modulo-6" />);
    fireEvent.change(screen.getByLabelText("Escribe tu pregunta"), {
      target: { value: "¿Qué es NotebookLM?" },
    });
    expect(screen.getByText(/Preguntá sobre este módulo o sobre cualquier tema del curso/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Preguntar al Asistente IA" }));

    await screen.findByText("Respuesta fundamentada");
    expect(fetchMock).toHaveBeenCalledWith("/api/assistant", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        question: "¿Qué es NotebookLM?",
        courseSlug: "ia-educativa-notebooklm",
        moduleSlug: "modulo-6",
      }),
    }));

    expect(screen.getByRole("link", { name: "Ver fuente S1" })).toHaveAttribute("href", "#assistant-source-s1");
    const sourceCard = document.querySelector("#assistant-source-s1");
    expect(sourceCard).not.toBeNull();
    expect(within(sourceCard as HTMLElement).getByText("Módulo 6 · NotebookLM")).toBeInTheDocument();
    expect(within(sourceCard as HTMLElement).getByText("Qué es NotebookLM")).toBeInTheDocument();
    expect(within(sourceCard as HTMLElement).getByText("Trabajo con fuentes")).toBeInTheDocument();
    expect(within(sourceCard as HTMLElement).getByText("Páginas 3–4")).toBeInTheDocument();
    expect(within(sourceCard as HTMLElement).getByRole("link", { name: /Abrir material/ })).toHaveAttribute(
      "href",
      "/courses/ia-educativa-notebooklm/modules/modulo-6",
    );
    expect(screen.queryByText("0.91")).not.toBeInTheDocument();
  });

  it("renders the fixed insufficient-evidence message without inventing an answer", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      status: "insufficient_evidence",
      answer: null,
      sources: [],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    render(<AssistantChat courseSlug="ia-educativa-notebooklm" />);
    fireEvent.change(screen.getByLabelText("Escribe tu pregunta"), {
      target: { value: "¿Quién ganó el último partido?" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Preguntar al Asistente IA" }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(
        "El material del curso no contiene información suficiente para responder esta pregunta.",
      )).toBeInTheDocument();
    });
    expect(screen.queryByText("Respuesta fundamentada")).not.toBeInTheDocument();
    expect(screen.queryByText("Fuentes utilizadas")).not.toBeInTheDocument();
  });

  it("renders a controlled quota message without provider details", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      error: {
        code: "quota_exceeded",
        message: "El tutor alcanzó temporalmente su límite de uso. Intenta nuevamente más tarde.",
      },
    }), { status: 429, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    render(<AssistantChat courseSlug="ia-educativa-notebooklm" />);
    fireEvent.change(screen.getByLabelText("Escribe tu pregunta"), {
      target: { value: "¿Qué es NotebookLM?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Preguntar al Asistente IA" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El tutor alcanzó temporalmente su límite de uso. Intenta nuevamente más tarde.",
    );
    expect(document.body.textContent).not.toContain("GEMINI_API_KEY");
  });
});
