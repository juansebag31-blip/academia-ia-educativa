import { buildRagTutorPrompt, RAG_TUTOR_SYSTEM_INSTRUCTION } from "./answer-prompt";
import {
  DEFAULT_RAG_MAX_CONTEXT_CHUNKS,
  selectRagContext,
} from "./context-selection";
import type { RagGenerationProvider } from "./generation-provider";
import type { RagSearchResult } from "./retrieval";

export const DEFAULT_RAG_SUFFICIENCY_THRESHOLD = 0.7;

export type RagAnswerSource = {
  id: string;
  moduleNumber: number | null;
  moduleTitle: string | null;
  sectionTitle: string | null;
  subsectionTitle: string | null;
  pageStart: number;
  pageEnd: number;
  routePath: string | null;
  similarity: number;
};

export type GroundedRagAnswer = {
  status: "answered" | "insufficient_evidence";
  answer: string | null;
  sources: RagAnswerSource[];
};

export type RagCitationAudit = {
  citations: string[];
  invalidCitations: string[];
  allCitationsValid: boolean;
  hasAtLeastOneCitation: boolean;
  uncitedBlocks: string[];
  mentionsInternalMechanics: boolean;
};

export function auditRagAnswerCitations(answer: string, sources: RagAnswerSource[]) {
  const citationTokens = answer.match(/\[S[^\]\s]*\]/g) ?? [];
  const citations = [...new Set(citationTokens.map((token) => token.slice(1, -1)))];
  const available = new Set(sources.map((source) => source.id));
  const invalidCitations = citations.filter((citation) => !available.has(citation));
  const uncitedBlocks = answer
    .split(/\n{2,}|\n(?=[-*]\s)/)
    .map((block) => block.trim())
    .filter((block) => block.split(/\s+/).length >= 6 && !/\[S\d+\]/.test(block));

  return {
    citations,
    invalidCitations,
    allCitationsValid: invalidCitations.length === 0,
    hasAtLeastOneCitation: citations.length > 0,
    uncitedBlocks,
    mentionsInternalMechanics: /\b(?:similarity|similitud|embedding|vector(?:es)?|top[- ]?k|umbral)\b/i
      .test(answer),
  } satisfies RagCitationAudit;
}

function toAnswerSource(id: string, result: RagSearchResult): RagAnswerSource {
  return {
    id,
    moduleNumber: result.moduleNumber,
    moduleTitle: result.moduleTitle,
    sectionTitle: result.sectionTitle,
    subsectionTitle: result.subsectionTitle,
    pageStart: result.pageStart,
    pageEnd: result.pageEnd,
    routePath: result.routePath,
    similarity: result.similarity,
  };
}

export async function generateGroundedRagAnswer(options: {
  question: string;
  retrievalResults: RagSearchResult[];
  generationProvider: RagGenerationProvider;
  threshold?: number;
  maxContextChunks?: number;
}): Promise<GroundedRagAnswer> {
  const question = options.question.trim();
  if (!question) throw new Error("La pregunta del tutor RAG no puede estar vacía.");

  const threshold = options.threshold ?? DEFAULT_RAG_SUFFICIENCY_THRESHOLD;
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
    throw new Error("El umbral de suficiencia RAG debe estar entre 0 y 1.");
  }

  const top1Similarity = options.retrievalResults[0]?.similarity;
  if (top1Similarity === undefined || top1Similarity < threshold) {
    return { status: "insufficient_evidence", answer: null, sources: [] };
  }

  const contexts = selectRagContext(options.retrievalResults, {
    maxChunks: options.maxContextChunks ?? DEFAULT_RAG_MAX_CONTEXT_CHUNKS,
  });
  if (contexts.length === 0) {
    return { status: "insufficient_evidence", answer: null, sources: [] };
  }

  const sources = contexts.map((context) => toAnswerSource(context.id, context.result));
  const answer = (await options.generationProvider.generateAnswer({
    systemInstruction: RAG_TUTOR_SYSTEM_INSTRUCTION,
    userPrompt: buildRagTutorPrompt(question, contexts),
  })).trim();
  if (!answer) throw new Error("El proveedor generativo devolvió una respuesta vacía.");

  const citationAudit = auditRagAnswerCitations(answer, sources);
  if (!citationAudit.hasAtLeastOneCitation) {
    throw new Error("La respuesta generada no contiene ninguna cita de fuente.");
  }
  if (!citationAudit.allCitationsValid) {
    throw new Error(
      `La respuesta generada contiene citas inexistentes: ${citationAudit.invalidCitations.join(", ")}.`,
    );
  }

  return { status: "answered", answer, sources };
}
