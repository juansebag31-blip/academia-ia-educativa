"use client";

import { CheckCircle2, Save } from "lucide-react";
import { SanitizedHtml } from "./sanitized-html";
import { useAiEngineeringUnitState } from "./use-ai-engineering-unit-state";

type SelfAssessmentState = {
  responses: Record<string, string>;
  reviewed: boolean;
  status?: "not-started" | "in-progress" | "completed";
  completedAt?: string;
};

const initialSelfAssessmentState: SelfAssessmentState = {
  responses: {},
  reviewed: false,
};

const questionNumbers = Array.from({ length: 8 }, (_, index) => index + 1);

export function AiEngineeringSelfAssessment({
  courseSlug,
  moduleSlug,
  sourceHtml,
}: {
  courseSlug: string;
  moduleSlug: string;
  sourceHtml: string;
}) {
  const { value, status, updateValue, saveNow, saveValue } = useAiEngineeringUnitState(
    { courseSlug, moduleSlug, unitId: "autoevaluacion" },
    initialSelfAssessmentState,
  );

  return (
    <div className="space-y-6">
      <SanitizedHtml html={sourceHtml} />
      <div className="rounded-2xl border border-[#0f766e]/25 bg-[#f3f7f6] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-[#0b1f33]">Tus respuestas</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">Responde en el campo que tenga el mismo número que cada pregunta.</p>
          </div>
          <span
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${status === "saved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
          >
            <span aria-hidden="true" className={`size-2 rounded-full ${status === "saved" ? "bg-emerald-500" : "bg-amber-500"}`} />
            {status === "saved" ? "Guardado" : "Cambios pendientes"}
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {questionNumbers.map((questionNumber) => {
            const responseId = `respuesta-${questionNumber}`;
            return (
              <label key={responseId} htmlFor={`ai-engineering-${responseId}`} className="block">
                <span className="text-sm font-black text-[#0b1f33]">Respuesta {questionNumber}</span>
                <textarea
                  id={`ai-engineering-${responseId}`}
                  value={value.responses[responseId] ?? ""}
                  onChange={(event) => updateValue({
                    ...value,
                    responses: { ...value.responses, [responseId]: event.target.value },
                    status: value.reviewed ? "completed" : "in-progress",
                  })}
                  rows={4}
                  className="focus-ring mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white p-4 leading-7 text-slate-800 shadow-inner"
                />
              </label>
            );
          })}
        </div>

        <p className="mt-4 text-xs font-semibold text-slate-600">No hay puntuación ni respuestas correctas automáticas. Puedes volver y editar tus respuestas.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={saveNow}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-[#0f766e] bg-white px-4 py-3 text-sm font-black text-[#0f766e] hover:bg-emerald-50"
          >
            <Save size={18} />
            Guardar respuestas
          </button>
          <button
            type="button"
            onClick={() => saveValue({
              ...value,
              reviewed: true,
              status: "completed",
              completedAt: value.completedAt ?? new Date().toISOString(),
            })}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-3 text-sm font-black text-white hover:bg-[#0b5f59] disabled:cursor-default disabled:bg-emerald-700"
            disabled={value.reviewed}
          >
            <CheckCircle2 size={18} />
            {value.reviewed ? "Respuestas revisadas" : "He revisado mis respuestas"}
          </button>
        </div>
        <p aria-live="polite" className="sr-only">
          {value.reviewed ? "Autoevaluación completada." : "Autoevaluación pendiente de revisar."}
        </p>
      </div>
    </div>
  );
}
