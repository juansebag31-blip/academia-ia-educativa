"use client";

import { CheckCircle2, Save } from "lucide-react";
import { SanitizedHtml } from "./sanitized-html";
import { useAiEngineeringUnitState } from "./use-ai-engineering-unit-state";

type ActivityState = {
  response: string;
  completed: boolean;
  status?: "not-started" | "in-progress" | "completed";
  completedAt?: string;
};

const initialActivityState: ActivityState = {
  response: "",
  completed: false,
};

export function AiEngineeringActivity({
  courseSlug,
  moduleSlug,
  sourceHtml,
  unitId,
  responseLabel,
  placeholder,
}: {
  courseSlug: string;
  moduleSlug: string;
  sourceHtml: string;
  unitId: string;
  responseLabel: string;
  placeholder: string;
}) {
  const { value, status, updateValue, saveNow, saveValue } = useAiEngineeringUnitState(
    { courseSlug, moduleSlug, unitId },
    initialActivityState,
  );

  return (
    <div className="space-y-6">
      <SanitizedHtml html={sourceHtml} />
      <div className="rounded-2xl border border-[#0f766e]/25 bg-[#f3f7f6] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="ai-engineering-activity-response" className="text-lg font-black text-[#0b1f33]">
            {responseLabel}
          </label>
          <SaveIndicator status={status} />
        </div>
        <textarea
          id="ai-engineering-activity-response"
          value={value.response}
          onChange={(event) => updateValue({
            ...value,
            response: event.target.value,
            status: value.completed ? "completed" : "in-progress",
          })}
          rows={12}
          className="focus-ring mt-4 w-full resize-y rounded-xl border border-slate-300 bg-white p-4 leading-7 text-slate-800 shadow-inner"
          placeholder={placeholder}
        />
        <p className="mt-2 text-xs font-semibold text-slate-600">La respuesta se guarda automáticamente en este navegador y puede editarse después.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={saveNow}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-[#0f766e] bg-white px-4 py-3 text-sm font-black text-[#0f766e] hover:bg-emerald-50"
          >
            <Save size={18} />
            Guardar respuesta
          </button>
          <button
            type="button"
            onClick={() => saveValue({
              ...value,
              completed: true,
              status: "completed",
              completedAt: value.completedAt ?? new Date().toISOString(),
            })}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-3 text-sm font-black text-white hover:bg-[#0b5f59] disabled:cursor-default disabled:bg-emerald-700"
            disabled={value.completed}
          >
            <CheckCircle2 size={18} />
            {value.completed ? "Actividad terminada" : "Marcar actividad como terminada"}
          </button>
        </div>
        <p aria-live="polite" className="sr-only">
          {value.completed ? "Actividad completada." : "Actividad pendiente de completar."}
        </p>
      </div>
    </div>
  );
}

function SaveIndicator({ status }: { status: "pending" | "saved" }) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${status === "saved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
    >
      <span aria-hidden="true" className={`size-2 rounded-full ${status === "saved" ? "bg-emerald-500" : "bg-amber-500"}`} />
      {status === "saved" ? "Guardado" : "Cambios pendientes"}
    </span>
  );
}
