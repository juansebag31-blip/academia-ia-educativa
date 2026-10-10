import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AssistantChat, buildDeepeningContext, buildGoogleSearchUrl } from "./assistant-chat";

const fetchMock = vi.fn<typeof fetch>();
const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
const answeredQuestion = "¿Qué es NotebookLM?";
const answeredText = "NotebookLM trabaja con las fuentes seleccionadas [S1].";
const answeredPayload = {
  status: "answered",
  answer: answeredText,
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
} as const;

function mockAnsweredRequest() {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(answeredPayload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  }));
  vi.stubGlobal("fetch", fetchMock);
}

async function renderAnsweredAssistant(question = answeredQuestion) {
  mockAnsweredRequest();
  render(<AssistantChat courseSlug="ia-educativa-notebooklm" moduleSlug="modulo-6" />);
  fireEvent.change(screen.getByLabelText("Escribe tu pregunta"), { target: { value: question } });
  fireEvent.click(screen.getByRole("button", { name: "Preguntar al Asistente IA" }));
  await screen.findByText("Respuesta fundamentada");
}

function stubClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  return writeText;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  fetchMock.mockReset();
  if (originalClipboardDescriptor) {
    Object.defineProperty(navigator, "clipboard", originalClipboardDescriptor);
  } else {
    Reflect.deleteProperty(navigator, "clipboard");
  }
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
    expect(screen.queryByRole("group", { name: "Acciones para profundizar la respuesta" })).not.toBeInTheDocument();
  });

  it("sends course and module context and renders traceable sources", async () => {
    mockAnsweredRequest();

    render(<AssistantChat courseSlug="ia-educativa-notebooklm" moduleSlug="modulo-6" />);
    fireEvent.change(screen.getByLabelText("Escribe tu pregunta"), {
      target: { value: answeredQuestion },
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
    expect(screen.getByRole("group", { name: "Acciones para profundizar la respuesta" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copiar respuesta" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buscar en Google" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copiar para profundizar" })).toBeInTheDocument();
  });

  it("copies only the plain assistant answer and shows accessible feedback without another request", async () => {
    const writeText = stubClipboard();
    await renderAnsweredAssistant();

    fireEvent.click(screen.getByRole("button", { name: "Copiar respuesta" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(answeredText));
    expect(screen.getByRole("status")).toHaveTextContent("Respuesta copiada");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("builds a short Google search from the submitted question without using the answer", async () => {
    const question = "¿Por qué una IA puede alucinar?";
    await renderAnsweredAssistant(question);

    const googleLink = screen.getByRole("link", { name: "Buscar en Google" });
    expect(googleLink).toHaveAttribute("href", buildGoogleSearchUrl(question));
    expect(googleLink).toHaveAttribute("href", "https://www.google.com/search?q=%C2%BFPor%20qu%C3%A9%20una%20IA%20puede%20alucinar%3F%20explicaci%C3%B3n%20fuentes");
    expect(googleLink).toHaveAttribute("target", "_blank");
    expect(googleLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(googleLink.getAttribute("href")).not.toContain(encodeURIComponent(answeredText));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("copies structured study context and opens Google without another backend request", async () => {
    const writeText = stubClipboard();
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
    await renderAnsweredAssistant();

    fireEvent.click(screen.getByRole("button", { name: "Copiar para profundizar" }));

    const expectedContext = buildDeepeningContext(answeredQuestion, answeredText);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expectedContext));
    expect(expectedContext).toContain("Pregunta original:\n¿Qué es NotebookLM?");
    expect(expectedContext).toContain(`Explicación de mi curso:\n${answeredText}`);
    expect(expectedContext).toContain("- indicar fuentes confiables y actuales.");
    expect(openSpy).toHaveBeenCalledWith("https://www.google.com/", "_blank", "noopener,noreferrer");
    expect(writeText.mock.invocationCallOrder[0]).toBeLessThan(openSpy.mock.invocationCallOrder[0]);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Contexto copiado. Pegalo en Google para profundizar.",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("handles unavailable clipboard access without exposing an internal error", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    await renderAnsweredAssistant();

    fireEvent.click(screen.getByRole("button", { name: "Copiar respuesta" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "No se pudo copiar automáticamente. Seleccioná el texto de la respuesta para copiarlo.",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
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
    expect(screen.queryByRole("group", { name: "Acciones para profundizar la respuesta" })).not.toBeInTheDocument();
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
    expect(screen.queryByRole("group", { name: "Acciones para profundizar la respuesta" })).not.toBeInTheDocument();
  });
});
