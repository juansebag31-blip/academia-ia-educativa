export type RagGenerationRequest = {
  systemInstruction: string;
  userPrompt: string;
};

export interface RagGenerationProvider {
  readonly model: string;
  generateAnswer(request: RagGenerationRequest): Promise<string>;
}
