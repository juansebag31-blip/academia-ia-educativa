"use client";

import Link from "next/link";
import { BrainCircuit, BookOpenCheck, ExternalLink, LoaderCircle, Send, ShieldCheck, Sparkles } from "lucide-react";
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
  const scopeDescription = moduleSlug
    ? "Preguntá sobre este módulo o sobre cualquier tema del curso. El asistente responde basándose en los materiales de Academia IA, con fuentes y páginas para que puedas verificar la información."
    : "Consultá cualquiera de los 11 módulos. El asistente responde basándose en los materiales de Academia IA, con fuentes y páginas para que puedas verificar la información.";

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
      id="asistente-ia"
      aria-labelledby={`${fieldId}-title`}
      className="scroll-mt-40 overflow-hidden rounded-3xl border border-blue-300/70 bg-white shadow-[0_24px_70px_rgba(37,99,235,0.16)] sm:scroll-mt-28"
    >
      <div className="relative overflow-hidden bg-[linear-gradient(125deg,#071a2b_0%,#123b73_55%,#5b21b6_100%)] px-5 py-7 text-white sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="relative flex min-w-0 items-start gap-4 sm:gap-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-cyan-100 shadow-xl shadow-blue-950/30 backdrop-blur sm:h-16 sm:w-16">
            <BrainCircuit size={31} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
              <Sparkles size={15} aria-hidden="true" />
              Inteligencia artificial para aprender
            </p>
            <h2 id={`${fieldId}-title`} className="mt-2 break-words text-2xl font-black leading-tight sm:text-3xl">
              Asistente IA del curso
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-blue-50 sm:text-base sm:leading-7">
              {scopeDescription}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submitQuestion} className="space-y-4 bg-gradient-to-br from-white via-blue-50/55 to-cyan-50/60 p-5 sm:p-8">
        <label htmlFor={fieldId} className="block text-base font-black text-ink">
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
          className="focus-ring min-h-32 w-full resize-y rounded-2xl border border-blue-300 bg-white px-4 py-4 text-base leading-7 text-ink shadow-[0_10px_30px_rgba(37,99,235,0.08)] placeholder:text-slate-400 disabled:cursor-wait disabled:bg-slate-50"
          aria-describedby={`${fieldId}-context ${fieldId}-safety`}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <p id={`${fieldId}-context`} className="text-sm font-semibold leading-6 text-slate-700">
              Respuestas basadas en los materiales del curso, con fuentes y páginas para verificar la información.
            </p>
            <p id={`${fieldId}-safety`} className="flex items-start gap-1.5 text-xs leading-5 text-slate-500">
              <ShieldCheck className="mt-0.5 shrink-0" size={14} aria-hidden="true" />
              <span>No incluyas datos personales ni información sensible. Máximo {RAG_ASSISTANT_MAX_QUESTION_LENGTH} caracteres.</span>
            </p>
          </div>
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="focus-ring inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-ember px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/20 transition hover:bg-ember-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isLoading ? (
              <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
            ) : (
              <Send size={18} aria-hidden="true" />
            )}
            {isLoading ? "Consultando fuentes…" : "Preguntar al Asistente IA"}
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
