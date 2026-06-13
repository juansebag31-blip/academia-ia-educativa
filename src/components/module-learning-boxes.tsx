"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Award,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  Copy,
  FilePenLine,
  FlaskConical,
  Layers3,
  MonitorPlay,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import type { CourseModule } from "@/lib/course";
import { learningSections, type LearningSectionKey } from "@/lib/learning-flow";
import { getLocalLearningState, saveLocalModuleState } from "@/lib/learning/local-learning-state";

type SavedState = {
  path: Record<string, boolean>;
  mastery: Record<string, boolean>;
  simulator: Record<string, boolean>;
  notebook: Record<string, string>;
  quiz: Record<string, boolean>;
};

const emptyState: SavedState = {
  path: {},
  mastery: {},
  simulator: {},
  notebook: {},
  quiz: {},
};

const sectionIcons: Record<LearningSectionKey, LucideIcon> = {
  guidedPath: BookOpenCheck,
  studentNotebook: FilePenLine,
  promptTemplates: Clipboard,
  simulator: MonitorPlay,
  lab: FlaskConical,
  practiceQuiz: BookOpenCheck,
  flashcards: Layers3,
  masteryChecklist: CheckCircle2,
  rubric: Award,
};

export function ModuleLearningBoxes({ courseModule }: { courseModule: CourseModule }) {
  const [state, setState] = useState<SavedState>(emptyState);
  const [openSection, setOpenSection] = useState<LearningSectionKey | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [revealedQuiz, setRevealedQuiz] = useState<Record<string, boolean>>({});
  const storageKey = useMemo(() => `academia-ia-active-learning-${courseModule.slug}`, [courseModule.slug]);

  useEffect(() => {
    const canonical = getLocalLearningState().moduleStates[courseModule.slug];
    const saved = window.localStorage.getItem(storageKey);
    const value = canonical ?? (saved ? JSON.parse(saved) : null);
    if (value) setState({ ...emptyState, ...(value as SavedState) });
  }, [courseModule.slug, storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
    saveLocalModuleState(courseModule.slug, state);
  }, [courseModule.slug, state, storageKey]);

  const pathDone = countDone(state.path, courseModule.guidedPath.length);
  const masteryDone = countDone(state.mastery, courseModule.masteryChecklist.length);
  const simulatorDone = countDone(state.simulator, courseModule.simulator.length);
  const quizDone = countDone(state.quiz, courseModule.practiceQuiz.length);
  const nextPathIndex = courseModule.guidedPath.findIndex((step) => !state.path[step.id]);
  const nextPathStep = nextPathIndex === -1 ? null : courseModule.guidedPath[nextPathIndex];

  async function copyPrompt(id: string, prompt: string) {
    await navigator.clipboard.writeText(prompt);
    setCopiedPrompt(id);
    window.setTimeout(() => setCopiedPrompt(null), 1600);
  }

  function renderContent(key: LearningSectionKey): ReactNode {
    switch (key) {
      case "guidedPath":
        return (
          <>
            <div className="mb-5 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-slate-700">
              {nextPathStep ? (
                <span>
                  Siguiente sugerido: <span className="text-ember">{nextPathIndex + 1}. {nextPathStep.title}</span>
                </span>
              ) : (
                <span className="text-emerald-700">Ruta base completada</span>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {courseModule.guidedPath.map((step, index) => {
                const completed = Boolean(state.path[step.id]);
                const isNext = nextPathStep?.id === step.id;
                return (
                  <label
                    key={step.id}
                    className={`relative flex min-h-48 cursor-pointer flex-col rounded-2xl border p-5 transition ${
                      completed
                        ? "border-emerald-200 bg-emerald-50"
                        : isNext
                          ? "border-blue-300 bg-white shadow-card"
                          : "border-line-soft bg-slate-50 hover:border-blue-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={completed}
                      onChange={(event) =>
                        setState((current) => ({
                          ...current,
                          path: { ...current.path, [step.id]: event.target.checked },
                        }))
                      }
                      className="peer sr-only"
                    />
                    <div className="flex items-start justify-between gap-4">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black ${completed ? "bg-emerald-600 text-white" : "bg-white text-ember"}`}>
                        {completed ? <CheckCircle2 size={20} /> : index + 1}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black ${completed ? "bg-white text-emerald-700" : isNext ? "bg-blue-50 text-ember" : "bg-white text-slate-500"}`}>
                        {completed ? "Completado" : isNext ? "Siguiente" : "Pendiente"}
                      </span>
                    </div>
                    <span className="mt-5 text-xs font-black uppercase tracking-wide text-ember">Micro paso {index + 1}</span>
                    <span className="mt-2 text-lg font-black text-ink">{step.title}</span>
                    <span className="mt-3 text-sm leading-6 text-slate-600">{step.description}</span>
                  </label>
                );
              })}
            </div>
          </>
        );
      case "studentNotebook":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {courseModule.studentNotebook.map((note) => (
              <label key={note.id} className="block">
                <span className="text-sm font-black text-slate-700">{note.label}</span>
                <textarea
                  value={state.notebook[note.id] ?? ""}
                  onChange={(event) =>
                    setState((current) => ({
                      ...current,
                      notebook: { ...current.notebook, [note.id]: event.target.value },
                    }))
                  }
                  placeholder={note.placeholder}
                  className="mt-2 min-h-32 w-full resize-y rounded-xl border border-line-soft bg-slate-50 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-300"
                />
              </label>
            ))}
          </div>
        );
      case "promptTemplates":
        return (
          <div className="space-y-4">
            {courseModule.promptTemplates.map((template) => (
              <article key={template.id} className="rounded-2xl border border-line-soft bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="font-black text-ink">{template.title}</h4>
                    <p className="mt-1 text-sm text-slate-500">{template.useCase}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyPrompt(template.id, template.prompt)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-ember shadow-sm hover:bg-blue-50"
                  >
                    <Copy size={16} />
                    {copiedPrompt === template.id ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <p className="mt-4 rounded-xl bg-white p-4 text-sm leading-6 text-slate-700">{template.prompt}</p>
              </article>
            ))}
          </div>
        );
      case "simulator":
        return (
          <div className="space-y-3">
            {courseModule.simulator.map((step, index) => (
              <label key={step.id} className="flex cursor-pointer gap-3 rounded-xl border border-line-soft bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(state.simulator[step.id])}
                  onChange={(event) =>
                    setState((current) => ({
                      ...current,
                      simulator: { ...current.simulator, [step.id]: event.target.checked },
                    }))
                  }
                  className="mt-1 h-4 w-4 accent-blue-600"
                />
                <span>
                  <span className="block text-xs font-black uppercase tracking-wide text-ember">{index + 1}. {step.title}</span>
                  <span className="mt-1 block">{step.instruction}</span>
                </span>
              </label>
            ))}
          </div>
        );
      case "lab":
        return (
          <>
            <h4 className="font-black">{courseModule.lab.title}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-600">{courseModule.lab.objective}</p>
            <ol className="mt-4 space-y-3">
              {courseModule.lab.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-ember">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">{courseModule.lab.deliverable}</p>
          </>
        );
      case "practiceQuiz":
        return (
          <div className="space-y-4">
            {courseModule.practiceQuiz.map((question) => (
              <article key={question.id} className="rounded-2xl border border-line-soft bg-slate-50 p-4">
                <p className="text-sm font-black leading-6 text-ink">{question.question}</p>
                {revealedQuiz[question.id] ? <p className="mt-3 rounded-xl bg-white p-3 text-sm leading-6 text-slate-700">{question.answer}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setRevealedQuiz((current) => ({ ...current, [question.id]: !current[question.id] }))}
                    className="rounded-xl bg-white px-3 py-2 text-xs font-black text-ember shadow-sm"
                  >
                    {revealedQuiz[question.id] ? "Ocultar respuesta" : "Ver respuesta"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setState((current) => ({
                        ...current,
                        quiz: { ...current.quiz, [question.id]: !current.quiz[question.id] },
                      }))
                    }
                    className={`rounded-xl px-3 py-2 text-xs font-black shadow-sm ${state.quiz[question.id] ? "bg-emerald-50 text-emerald-700" : "bg-white text-slate-600"}`}
                  >
                    {state.quiz[question.id] ? "Entendido" : "Marcar entendido"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        );
      case "flashcards":
        return (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {courseModule.flashcards.map((card) => {
              const flipped = Boolean(flippedCards[card.id]);
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setFlippedCards((current) => ({ ...current, [card.id]: !current[card.id] }))}
                  className="min-h-32 rounded-2xl border border-line-soft bg-slate-50 p-4 text-left hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wide text-ember">{flipped ? "Respuesta" : "Pregunta"}</span>
                    <RotateCcw size={16} className="text-slate-400" />
                  </div>
                  <p className="mt-4 text-sm font-black leading-6 text-ink">{flipped ? card.back : card.front}</p>
                </button>
              );
            })}
          </div>
        );
      case "masteryChecklist":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            {courseModule.masteryChecklist.map((item) => (
              <label key={item.id} className="flex cursor-pointer gap-3 rounded-xl border border-line-soft bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(state.mastery[item.id])}
                  onChange={(event) =>
                    setState((current) => ({
                      ...current,
                      mastery: { ...current.mastery, [item.id]: event.target.checked },
                    }))
                  }
                  className="mt-1 h-4 w-4 accent-blue-600"
                />
                <span>{item.text}</span>
              </label>
            ))}
          </div>
        );
      case "rubric":
        return (
          <div className="grid gap-3 md:grid-cols-3">
            {courseModule.rubric.map((level) => (
              <article key={level.level} className="rounded-xl border border-line-soft bg-slate-50 p-4">
                <p className="text-sm font-black text-ember">{level.level}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{level.criteria}</p>
              </article>
            ))}
          </div>
        );
    }
  }

  return (
    <section className="rounded-2xl border border-line-soft bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-ember">Ruta de aprendizaje</p>
          <h2 className="mt-2 text-2xl font-black">Proceso guiado del módulo</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Abre cada paso para trabajar su contenido. El progreso queda guardado mientras avanzas.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-black text-slate-600 sm:grid-cols-4">
          <ProgressPill label="Ruta" value={`${pathDone}/${courseModule.guidedPath.length}`} />
          <ProgressPill label="Quiz" value={`${quizDone}/${courseModule.practiceQuiz.length}`} />
          <ProgressPill label="Simulador" value={`${simulatorDone}/${courseModule.simulator.length}`} />
          <ProgressPill label="Dominio" value={`${masteryDone}/${courseModule.masteryChecklist.length}`} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {learningSections.map((section) => {
          const expanded = openSection === section.key;
          const Icon = sectionIcons[section.key];
          const panelId = `${courseModule.slug}-learning-step-${section.step}`;
          return (
            <article
              key={section.key}
              className={`overflow-hidden rounded-2xl border bg-white transition ${
                expanded
                  ? "border-blue-300 shadow-card md:col-span-2 xl:col-span-3"
                  : "border-line-soft border-t-4 border-t-blue-500 hover:border-blue-200 hover:border-t-blue-500"
              }`}
            >
              <button
                type="button"
                aria-label={`Paso ${section.step}: ${section.title}`}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpenSection((current) => current === section.key ? null : section.key)}
                  className={`flex w-full items-start gap-4 p-5 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-tech-cyan ${
                  expanded ? "bg-gradient-to-r from-blue-50 via-cyan-50/50 to-violet-50/60" : "min-h-44"
                }`}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-black ${expanded ? "bg-ember text-white" : "bg-blue-50 text-ember"}`}>
                  {String(section.step).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-black uppercase tracking-wide text-ember">Paso {section.step}</span>
                  <span className="mt-2 block text-lg font-black leading-6 text-ink">{section.title}</span>
                  <span className="mt-2 block text-sm leading-5 text-slate-500">{section.subtitle}</span>
                </span>
                <span className={`mt-1 rounded-full p-2 text-slate-500 transition ${expanded ? "rotate-180 bg-white text-ember shadow-sm" : "bg-slate-50"}`}>
                  <ChevronDown size={18} />
                </span>
              </button>
              {expanded ? (
                <div
                  id={panelId}
                  role="region"
                  aria-label={`Contenido del paso ${section.step}: ${section.title}`}
                  className="border-t border-blue-100 p-5 sm:p-6"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <span className="rounded-xl bg-blue-50 p-3 text-ember"><Icon size={22} /></span>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-ember">Paso {section.step}</p>
                      <h3 className="text-xl font-black">{section.title}</h3>
                    </div>
                  </div>
                  {renderContent(section.key)}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProgressPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-blue-50 px-3 py-2 text-center text-ember">
      <span className="block text-[10px] uppercase tracking-wide">{label}</span>
      <span className="block text-sm">{value}</span>
    </div>
  );
}

function countDone(values: Record<string, boolean>, total: number) {
  return Math.min(total, Object.values(values).filter(Boolean).length);
}

