import "server-only";
import { GoogleGenAI } from "@google/genai";
import {
  RAG_EMBEDDING_DIMENSIONS,
  RAG_EMBEDDING_MODEL,
  assertRagEmbedding,
  type RagEmbeddingProvider,
} from "./embedding-provider";

type GeminiEmbeddingProviderOptions = {
  onRequest?: () => void | Promise<void>;
};

export class GeminiRagEmbeddingProvider implements RagEmbeddingProvider {
  readonly model = RAG_EMBEDDING_MODEL;
  readonly dimensions = RAG_EMBEDDING_DIMENSIONS;
  private readonly client: GoogleGenAI;
  private readonly onRequest?: GeminiEmbeddingProviderOptions["onRequest"];

  constructor(apiKey: string, options: GeminiEmbeddingProviderOptions = {}) {
    if (!apiKey.trim()) throw new Error("GEMINI_API_KEY no está configurada.");
    this.client = new GoogleGenAI({ apiKey });
    this.onRequest = options.onRequest;
  }

  async embed(text: string) {
    const [embedding] = await this.embedMany([text]);
    if (!embedding) throw new Error("Gemini no devolvió un embedding.");
    return embedding;
  }

  async embedMany(texts: string[]) {
    if (texts.length === 0) return [];
    await this.onRequest?.();
    const response = await this.client.models.embedContent({
      model: this.model,
      // Gemini Embedding 2 aggregates a bare string[] into one multimodal input.
      // Explicit Content objects request one embedding per text in the same call.
      contents: texts.map((text) => ({
        role: "user",
        parts: [{ text }],
      })),
      config: {
        outputDimensionality: this.dimensions,
      },
    });
    const embeddings = response.embeddings ?? [];
    if (embeddings.length !== texts.length) {
      throw new Error(
        `Gemini devolvió ${embeddings.length} embeddings para ${texts.length} textos.`,
      );
    }

    return embeddings.map((embedding, index) => {
      if (!embedding.values) {
        throw new Error(`Gemini no devolvió valores para el embedding ${index + 1}.`);
      }
      return assertRagEmbedding(embedding.values);
    });
  }
}
