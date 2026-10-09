"use client";

import Link from "next/link";
import { BookOpenCheck, ExternalLink, LoaderCircle, MessageCircleQuestion, Send } from "lucide-react";
import { FormEvent, Fragment, useId, useState } from "react";
import {
  RAG_ASSISTANT_MAX_QUESTION_LENGTH,
  type GroundedRagAnswer,
  type RagAnswerSource,
  type RagAssistantApiResponse,
} from "@/lib/rag/public-contract";

type AssistantChatProps = {
  courseSlug: string;
  moduleSlug?: string | null;
};

const insufficientMessage =
  "El material del curso no contiene información suficiente para responder esta pregunta.";

function isErrorResponse(response: RagAssistantApiResponse): response is Extract<
  RagAssistantApiResponse,
  { error: unknown }
> {
  return "error" in response;
}

function sourceAnchor(id: string) {
  return `assistant-source-${id.toLowerCase()}`;
}

function AnswerWithCitations({ answer }: { answer: string }) {
  const parts = answer.replace(/\*\*/g, "").split(/(\[S\d+\])/g);
  return (
    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-base">
      {parts.map((part, index) => {
        const sourceId = part.match(/^\[(S\d+)\]$/)?.[1];
        return sourceId ? (
          <a
            key={`${sourceId}-${index}`}
            href={`#${sourceAnchor(sourceId)}`}
            className="mx-0.5 inline-flex rounded-md bg-blue-100 px-1.5 py-0.5 text-xs font-black text-blue-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            aria-label={`Ver fuente ${sourceId}`}
          >
            {sourceId}
          </a>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        );
      })}
    </p>
  );
}

function sourceTitle(source: RagAnswerSource) {
  if (source.moduleNumber === null) return "Presentación general del programa";
  const title = source.moduleTitle?.replace(/^Módulo \d+\s*[-–:]\s*/i, "");
  return `Módulo ${source.moduleNumber}${title ? ` · ${title}` : ""}`;
}

function sourcePages(source: RagAnswerSource) {
  return source.pageStart === source.pageEnd
    ? `Página ${source.pageStart}`
    : `Páginas ${source.pageStart}–${source.pageEnd}`;
}

export function AssistantChat({ courseSlug, moduleSlug = null }: AssistantChatProps) {
  const fieldId = useId();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<GroundedRagAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmedQuestion, courseSlug, moduleSlug }),
      });
      const payload = await response.json() as RagAssistantApiResponse;
      if (!response.ok || isErrorResponse(payload)) {
        setError(isErrorResponse(payload)
          ? payload.error.message
          : "No fue posible consultar al tutor en este momento.");
        return;
      }
      setResult(payload);
    } catch {
      setError("No fue posible conectar con el tutor. Comprueba el servidor local e inténtalo nuevamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      aria-labelledby={`${fieldId}-title`}
      className="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-white via-blue-50/70 to-cyan-50 shadow-card"
    >
      <div className="border-b border-blue-100 px-5 py-5 sm:px-7">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-white shadow-lg shadow-blue-950/15">
            <MessageCircleQuestion size={23} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-ember">Tutor con fuentes</p>
            <h2 id={`${fieldId}-title`} className="mt-1 text-xl font-black text-ink sm:text-2xl">
              Pregunta al material del curso
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              El tutor responde únicamente con los módulos y documentos de Academia IA Educativa.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submitQuestion} className="space-y-4 p-5 sm:p-7">
        <label htmlFor={fieldId} className="block text-sm font-black text-slate-800">
          Escribe tu pregunta
        </label>
        <textarea
          id={fieldId}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={RAG_ASSISTANT_MAX_QUESTION_LENGTH}
          rows={4}
          disabled={isLoading}
          placeholder="Ejemplo: ¿Por qué una respuesta fluida de IA puede contener errores?"
          className="focus-ring w-full resize-y rounded-2xl border border-blue-200 bg-white px-4 py-3 text-base text-ink shadow-sm placeholder:text-slate-400 disabled:cursor-wait disabled:bg-slate-50"
          aria-describedby={`${fieldId}-help`}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p id={`${fieldId}-help`} className="text-xs leading-5 text-slate-500">
            No incluyas datos personales ni información sensible. Máximo {RAG_ASSISTANT_MAX_QUESTION_LENGTH} caracteres.
          </p>
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ember px-5 py-3 text-sm font-black text-white transition hover:bg-ember-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
            ) : (
              <Send size={18} aria-hidden="true" />
            )}
            {isLoading ? "Consultando fuentes…" : "Enviar pregunta"}
          </button>
        </div>
      </form>

      <div className="px-5 pb-5 sm:px-7 sm:pb-7" aria-live="polite" aria-busy={isLoading}>
        {error ? (
          <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            {error}
          </div>
        ) : null}

        {result?.status === "insufficient_evidence" ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-black text-ink">No encontré evidencia suficiente</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{insufficientMessage}</p>
          </div>
        ) : null}

        {result?.status === "answered" && result.answer ? (
          <div className="space-y-5 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-black text-ink">
                <BookOpenCheck size={18} className="text-ember" aria-hidden="true" />
                Respuesta fundamentada
              </p>
              <AnswerWithCitations answer={result.answer} />
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">Fuentes utilizadas</h3>
              <ol className="mt-3 grid gap-3 lg:grid-cols-2">
                {result.sources.map((source) => (
                  <li
                    id={sourceAnchor(source.id)}
                    key={source.id}
                    className="scroll-mt-28 rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="rounded-lg bg-blue-100 px-2 py-1 text-xs font-black text-blue-800">
                        {source.id}
                      </span>
                      <div className="min-w-0">
                        <p className="font-black text-ink">{sourceTitle(source)}</p>
                        {source.sectionTitle ? (
                          <p className="mt-1 text-sm font-semibold text-slate-700">{source.sectionTitle}</p>
                        ) : null}
                        {source.subsectionTitle ? (
                          <p className="mt-1 text-sm text-slate-600">{source.subsectionTitle}</p>
                        ) : null}
                        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                          {sourcePages(source)}
                        </p>
                        {source.routePath ? (
                          <Link
                            href={source.routePath}
                            className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-lg text-sm font-black text-ember hover:underline"
                          >
                            Abrir material
                            <ExternalLink size={14} aria-hidden="true" />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
