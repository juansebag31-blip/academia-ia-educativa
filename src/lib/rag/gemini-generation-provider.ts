import "server-only";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { withTransientRetry } from "./batching";
import type {
  RagGenerationProvider,
  RagGenerationRequest,
} from "./generation-provider";

type GeminiGenerationProviderOptions = {
  onRequest?: () => void | Promise<void>;
  onRetry?: (event: { attempt: number; delayMs: number; reason: string }) => void;
  maxAttempts?: number;
};

export class GeminiRagGenerationProvider implements RagGenerationProvider {
  readonly model: string;
  private readonly client: GoogleGenAI;
  private readonly onRequest?: GeminiGenerationProviderOptions["onRequest"];
  private readonly onRetry?: GeminiGenerationProviderOptions["onRetry"];
  private readonly maxAttempts: number;

  constructor(
    apiKey: string,
    model: string,
    options: GeminiGenerationProviderOptions = {},
  ) {
    if (!apiKey.trim()) throw new Error("GEMINI_API_KEY no está configurada.");
    if (!model.trim()) throw new Error("GEMINI_RAG_MODEL no está configurado.");
    if (
      options.maxAttempts !== undefined
      && (!Number.isInteger(options.maxAttempts) || options.maxAttempts < 1)
    ) {
      throw new Error("maxAttempts debe ser un entero positivo.");
    }
    this.client = new GoogleGenAI({ apiKey });
    this.model = model.trim();
    this.onRequest = options.onRequest;
    this.onRetry = options.onRetry;
    this.maxAttempts = options.maxAttempts ?? 6;
  }

  async generateAnswer(request: RagGenerationRequest) {
    const response = await withTransientRetry(
      async () => {
        await this.onRequest?.();
        return this.client.models.generateContent({
          model: this.model,
          contents: request.userPrompt,
          config: {
            httpOptions: { timeout: 90_000 },
            systemInstruction: request.systemInstruction,
            temperature: 0.1,
            topP: 0.9,
            maxOutputTokens: 800,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                answer: {
                  type: Type.STRING,
                  description: "Respuesta pedagógica en español con citas [S#].",
                },
              },
              required: ["answer"],
              propertyOrdering: ["answer"],
            },
          },
        });
      },
      {
        maxAttempts: this.maxAttempts,
        baseDelayMs: 2_000,
        maxDelayMs: 60_000,
        onRetry: this.onRetry,
      },
    );

    const text = response.text?.trim();
    if (!text) throw new Error("Gemini no devolvió texto para la respuesta RAG.");

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Gemini devolvió una respuesta RAG que no es JSON válido.");
    }
    if (
      !parsed
      || typeof parsed !== "object"
      || typeof (parsed as { answer?: unknown }).answer !== "string"
      || !(parsed as { answer: string }).answer.trim()
    ) {
      throw new Error("Gemini devolvió una respuesta RAG sin el campo answer esperado.");
    }
    return (parsed as { answer: string }).answer.trim();
  }
}
