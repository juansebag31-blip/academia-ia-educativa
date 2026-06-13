"use client";

import { useActionState, useEffect, useState } from "react";
import {
  clearLocalLearningState,
  getLocalLearningState,
  hasLocalLearningProgress,
} from "@/lib/learning/local-learning-state";
import {
  importLearningProgress,
  initialImportState,
} from "@/lib/learning/import-actions";

export function ImportProgressCard() {
  const [payload, setPayload] = useState("");
  const [hasProgress, setHasProgress] = useState(false);
  const [state, action, pending] = useActionState(importLearningProgress, initialImportState);

  useEffect(() => {
    const local = getLocalLearningState();
    setPayload(JSON.stringify(local));
    setHasProgress(hasLocalLearningProgress(local));
  }, []);

  if (!hasProgress && !state.success) {
    return (
      <section className="rounded-2xl border border-line-soft bg-white p-6 shadow-card">
        <h2 className="text-xl font-black">Progreso visitante</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Este navegador todavía no tiene progreso local para importar.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-card">
      <h2 className="text-xl font-black">Importar progreso visitante</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        Sincroniza las lecciones, actividades y exámenes realizados antes de iniciar sesión.
      </p>
      {state.message ? (
        <p className={`mt-4 rounded-xl p-3 text-sm font-bold ${state.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {state.message}
        </p>
      ) : null}
      {state.success ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-700">
            {state.imported.lessons} lecciones · {state.imported.modules} módulos · {state.imported.exams} exámenes
          </p>
          <button
            type="button"
            onClick={() => {
              clearLocalLearningState();
              setHasProgress(false);
            }}
            className="mt-4 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-black text-ember"
          >
            Limpiar copia local
          </button>
        </div>
      ) : (
        <form action={action} className="mt-5">
          <input type="hidden" name="payload" value={payload} />
          <button disabled={pending} className="rounded-xl bg-ember px-5 py-3 text-sm font-black text-white disabled:opacity-60">
            {pending ? "Importando..." : "Importar y sincronizar"}
          </button>
        </form>
      )}
    </section>
  );
}
