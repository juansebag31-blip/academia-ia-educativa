"use client";

import { useActionState } from "react";
import { Award, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { CourseModule } from "@/lib/course";
import { submitModuleExam } from "@/lib/exam-actions";
import { initialExamState } from "@/lib/exam-state";
import { ProgressBar } from "./progress-bar";

export function ModuleExam({ courseModule }: { courseModule: CourseModule }) {
  const [state, action, pending] = useActionState(submitModuleExam, initialExamState);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line-soft bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-ember">Examen de certificación</p>
            <h1 className="mt-2 text-3xl font-black">{courseModule.title}</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Responde 20 preguntas basadas en las fuentes y el contenido del módulo. Necesitas 80% o más para certificar.
            </p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-5 text-center">
            <p className="text-4xl font-black text-ember">80%</p>
            <p className="text-sm font-bold text-slate-600">mínimo requerido</p>
          </div>
        </div>
      </section>

      {state.submitted && (
        <section className={`rounded-2xl border p-6 shadow-card ${state.passed ? "border-emerald-200 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <span className={`mt-1 rounded-2xl p-3 ${state.passed ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-ember"}`}>
                {state.passed ? <Award size={28} /> : <RotateCcw size={28} />}
              </span>
              <div>
                <h2 className="text-2xl font-black">{state.passed ? "Certificación obtenida" : "Examen no aprobado todavía"}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-700">{state.message}</p>
                <p className="mt-3 text-sm text-slate-600">
                  Correctas: {state.correct} · Incorrectas: {state.incorrect} · Sin responder: {state.unanswered}
                </p>
              </div>
            </div>
            <div className="min-w-52">
              <div className="mb-2 flex justify-between text-sm font-bold">
                <span>Resultado</span>
                <span>{state.percent}%</span>
              </div>
              <ProgressBar percent={state.percent} />
            </div>
          </div>
        </section>
      )}

      <form action={action} className="space-y-5">
        <input type="hidden" name="moduleSlug" value={courseModule.slug} />
        {courseModule.examQuestions.map((question, index) => (
          <fieldset key={question.id} className="rounded-2xl border border-line-soft bg-white p-5 shadow-card">
            <legend className="text-base font-black">
              {index + 1}. {question.prompt}
            </legend>
            <div className="mt-4 grid gap-3">
              {question.options.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line-soft p-4 text-sm transition hover:border-blue-200 hover:bg-blue-50">
                  <input className="mt-1 accent-ember" type="radio" name={question.id} value={option.id} />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>
            {state.submitted && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                {state.passed ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={17} /> : <XCircle className="mt-0.5 shrink-0 text-ember" size={17} />}
                {question.explanation}
              </p>
            )}
          </fieldset>
        ))}
        <button
          disabled={pending}
          className="sticky bottom-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ember px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-950/20 transition hover:bg-ember-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Corrigiendo examen..." : "Enviar examen"}
        </button>
      </form>
    </div>
  );
}

