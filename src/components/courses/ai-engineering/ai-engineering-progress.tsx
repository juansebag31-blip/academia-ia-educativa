"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  RotateCcw,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  aiEngineeringProgressUnits,
  completeAiEngineeringStandardUnit,
  ensureAiEngineeringModuleCompletion,
  findAiEngineeringProgressUnit,
  markAiEngineeringUnitInProgress,
  readAiEngineeringModuleProgress,
  recordAiEngineeringLastUnit,
  type AiEngineeringModuleProgressSnapshot,
  type AiEngineeringProgressStatus,
  type AiEngineeringProgressUnitId,
} from "@/lib/courses/ai-engineering/progress";
import {
  AI_ENGINEERING_UNIT_STATE_EVENT,
  type AiEngineeringUnitCoordinates,
} from "@/lib/courses/ai-engineering/unit-storage";

type StandardProgressUnitId = Exclude<
  AiEngineeringProgressUnitId,
  "actividad" | "autoevaluacion"
>;

type ProgressContextValue = {
  snapshot: AiEngineeringModuleProgressSnapshot;
  hydrated: boolean;
  resumeUnitId?: AiEngineeringProgressUnitId;
  dismissResume: () => void;
  completeUnit: (unitId: StandardProgressUnitId) => void;
  visitUnit: (unitId: AiEngineeringProgressUnitId) => void;
  refresh: () => void;
};

const emptyStatuses = Object.fromEntries(
  aiEngineeringProgressUnits.map((unit) => [unit.id, "not-started"]),
) as Record<AiEngineeringProgressUnitId, AiEngineeringProgressStatus>;

const emptySnapshot: AiEngineeringModuleProgressSnapshot = {
  statuses: emptyStatuses,
  completedCount: 0,
  percentage: 0,
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function AiEngineeringProgressProvider({
  courseSlug,
  moduleSlug,
  children,
}: {
  courseSlug: string;
  moduleSlug: string;
  children: React.ReactNode;
}) {
  const progress = useAiEngineeringProgressSnapshot(courseSlug, moduleSlug);
  const lastUnitRef = useRef<AiEngineeringProgressUnitId | undefined>(undefined);
  const resumeInitializedRef = useRef(false);
  const [resumeUnitId, setResumeUnitId] = useState<AiEngineeringProgressUnitId>();

  const { refresh } = progress;

  useEffect(() => {
    lastUnitRef.current = progress.snapshot.lastUnitId;
  }, [progress.snapshot.lastUnitId]);

  useEffect(() => {
    if (!progress.hydrated || resumeInitializedRef.current) return;
    resumeInitializedRef.current = true;
    if (!window.location.hash) setResumeUnitId(progress.snapshot.lastUnitId);
  }, [progress.hydrated, progress.snapshot.lastUnitId]);

  const visitUnit = useCallback((unitId: AiEngineeringProgressUnitId) => {
    markAiEngineeringUnitInProgress(courseSlug, moduleSlug, unitId);
    recordAiEngineeringLastUnit(courseSlug, moduleSlug, unitId);
    lastUnitRef.current = unitId;
    refresh();
  }, [courseSlug, moduleSlug, refresh]);

  const completeUnit = useCallback((unitId: StandardProgressUnitId) => {
    completeAiEngineeringStandardUnit(courseSlug, moduleSlug, unitId);
    recordAiEngineeringLastUnit(courseSlug, moduleSlug, unitId);
    lastUnitRef.current = unitId;
    refresh();
  }, [courseSlug, moduleSlug, refresh]);

  useEffect(() => {
    if (!progress.hydrated || typeof IntersectionObserver === "undefined") return;

    const hasStoredContinuation = Boolean(lastUnitRef.current) && !window.location.hash;
    let firstObservation = true;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      if (!visible) return;

      const unit = aiEngineeringProgressUnits.find(
        (candidate) => candidate.sectionId === visible.target.id,
      );
      if (!unit) return;

      if (firstObservation && hasStoredContinuation && unit.id === "orientacion") {
        firstObservation = false;
        return;
      }
      firstObservation = false;

      if (lastUnitRef.current !== unit.id) {
        markAiEngineeringUnitInProgress(courseSlug, moduleSlug, unit.id);
        recordAiEngineeringLastUnit(courseSlug, moduleSlug, unit.id);
        lastUnitRef.current = unit.id;
      }
    }, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: [0.15, 0.35, 0.6],
    });

    for (const unit of aiEngineeringProgressUnits) {
      const section = document.getElementById(unit.sectionId);
      if (section) observer.observe(section);
    }

    return () => observer.disconnect();
  }, [courseSlug, moduleSlug, progress.hydrated]);

  useEffect(() => {
    if (!progress.hydrated || progress.snapshot.completedCount !== aiEngineeringProgressUnits.length) {
      return;
    }
    if (!progress.snapshot.completedAt) ensureAiEngineeringModuleCompletion(courseSlug, moduleSlug);
  }, [courseSlug, moduleSlug, progress.hydrated, progress.snapshot.completedAt, progress.snapshot.completedCount]);

  const value = useMemo<ProgressContextValue>(() => ({
    snapshot: progress.snapshot,
    hydrated: progress.hydrated,
    resumeUnitId,
    dismissResume: () => setResumeUnitId(undefined),
    completeUnit,
    visitUnit,
    refresh,
  }), [completeUnit, progress.hydrated, progress.snapshot, refresh, resumeUnitId, visitUnit]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function AiEngineeringProgressNavigation() {
  const { snapshot, resumeUnitId, dismissResume, visitUnit } = useProgressContext();
  const lastUnit = resumeUnitId
    ? findAiEngineeringProgressUnit(resumeUnitId)
    : undefined;

  return (
    <div className="sticky top-3 z-30 space-y-3">
      {lastUnit && snapshot.percentage < 100 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#0f766e]/25 bg-[#eef7f5] px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#0f766e]">Continuidad de estudio</p>
            <p className="mt-1 text-sm font-bold text-[#0b1f33]">Última etapa: {lastUnit.label}</p>
          </div>
          <a
            href={`#${lastUnit.sectionId}`}
            onClick={() => {
              dismissResume();
              visitUnit(lastUnit.id);
            }}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-black text-white"
          >
            Continuar donde lo dejaste
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      ) : null}

      <details className="group rounded-2xl border border-slate-200 bg-white/95 shadow-card backdrop-blur">
        <summary className="focus-ring cursor-pointer list-none rounded-2xl px-5 py-4 marker:content-none">
          <span className="flex items-center justify-between gap-4">
            <span>
              <span className="block font-black text-[#0b1f33]">Recorrido del módulo · 8 etapas</span>
              <span className="mt-1 block text-xs font-bold text-slate-600">
                {snapshot.completedCount} de 8 etapas · {snapshot.percentage} % completado
              </span>
            </span>
            <span aria-hidden="true" className="text-xl text-[#0f766e] group-open:rotate-45 motion-reduce:transition-none">+</span>
          </span>
          <ProgressBar percentage={snapshot.percentage} label="Progreso general del Módulo 1" />
        </summary>
        <nav aria-label="Navegación interna del módulo" className="border-t border-slate-200 p-3">
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {aiEngineeringProgressUnits.map((unit, index) => {
              const status = snapshot.statuses[unit.id];
              return (
                <li key={unit.id}>
                  <a
                    href={`#${unit.sectionId}`}
                    onClick={() => visitUnit(unit.id)}
                    className="focus-ring flex min-h-16 items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-black text-slate-700 hover:border-[#0f766e]/20 hover:bg-[#e8f5f2]"
                  >
                    <span className="font-mono text-xs text-[#0f766e]">{String(index + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{unit.label}</span>
                      <span className={`mt-1 block text-[11px] ${statusTone(status)}`}>{statusLabel(status)}</span>
                    </span>
                    <StatusIcon status={status} />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </details>
    </div>
  );
}

export function AiEngineeringUnitCompletion({
  unitId,
}: {
  unitId: StandardProgressUnitId;
}) {
  const { snapshot, completeUnit } = useProgressContext();
  const status = snapshot.statuses[unitId];
  const completed = status === "completed";

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#0f766e]/20 bg-[#f3f7f6] p-4 sm:flex-row sm:items-center sm:justify-between">
      <span role="status" aria-live="polite" className={`inline-flex items-center gap-2 text-sm font-black ${statusTone(status)}`}>
        <StatusIcon status={status} />
        {completed ? "Sección completada" : statusLabel(status)}
      </span>
      <button
        type="button"
        onClick={() => completeUnit(unitId)}
        disabled={completed}
        className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-3 text-sm font-black text-white disabled:cursor-default disabled:bg-emerald-700"
      >
        <CheckCircle2 size={18} aria-hidden="true" />
        {completed ? "Sección completada" : "Marcar sección como completada"}
      </button>
    </div>
  );
}

export function AiEngineeringModuleCompletion({ courseHref }: { courseHref: string }) {
  const { snapshot, visitUnit } = useProgressContext();
  if (snapshot.percentage !== 100) return null;

  const completedAt = snapshot.completedAt ? new Date(snapshot.completedAt) : new Date();
  const formattedDate = new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(completedAt);

  return (
    <section aria-live="polite" className="rounded-3xl border border-emerald-300 bg-[linear-gradient(135deg,#ecfdf5,#f0fdfa)] p-6 shadow-card sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white">
          <CheckCircle2 size={26} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-800">100 % completado</p>
          <h2 className="mt-1 text-2xl font-black text-[#0b1f33]">Módulo 1 completado</h2>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            Fecha local de finalización: <time dateTime={completedAt.toISOString()}>{formattedDate}</time>
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href="#orientacion"
          onClick={() => visitUnit("orientacion")}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700 bg-white px-4 py-3 text-sm font-black text-emerald-800"
        >
          <RotateCcw size={17} aria-hidden="true" />
          Repasar el módulo
        </a>
        <Link href={courseHref} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-3 text-sm font-black text-white">
          Volver al curso
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function AiEngineeringCourseProgressCta({
  courseSlug,
  moduleSlug,
  moduleHref,
}: {
  courseSlug: string;
  moduleSlug: string;
  moduleHref: string;
}) {
  const { snapshot } = useAiEngineeringProgressSnapshot(courseSlug, moduleSlug);
  const started = snapshot.percentage > 0 || Object.values(snapshot.statuses).some((status) => status === "in-progress");

  return (
    <div className="mt-8 max-w-md" aria-live="polite">
      <p className="text-sm font-black text-[#0b1f33]">
        {snapshot.completedCount} de 8 etapas · {snapshot.percentage} % completado
      </p>
      <ProgressBar percentage={snapshot.percentage} label="Progreso del Módulo 1" />
      <Link
        href={moduleHref}
        className="focus-ring mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-950/15 hover:bg-[#0b5f59]"
      >
        {started ? "Continuar Módulo 1" : "Comenzar Módulo 1"}
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );
}

export function useAiEngineeringProgressSnapshot(courseSlug: string, moduleSlug: string) {
  const [snapshot, setSnapshot] = useState<AiEngineeringModuleProgressSnapshot>(emptySnapshot);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setSnapshot(readAiEngineeringModuleProgress(courseSlug, moduleSlug));
  }, [courseSlug, moduleSlug]);

  useEffect(() => {
    refresh();
    setHydrated(true);

    const handleUnitChange = (event: Event) => {
      const detail = (event as CustomEvent<AiEngineeringUnitCoordinates>).detail;
      if (detail?.courseSlug === courseSlug && detail.moduleSlug === moduleSlug) refresh();
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key?.includes(encodeURIComponent(courseSlug)) && event.key.includes(encodeURIComponent(moduleSlug))) {
        refresh();
      }
    };

    window.addEventListener(AI_ENGINEERING_UNIT_STATE_EVENT, handleUnitChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(AI_ENGINEERING_UNIT_STATE_EVENT, handleUnitChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [courseSlug, moduleSlug, refresh]);

  return { snapshot, hydrated, refresh };
}

function useProgressContext() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("AI Engineering progress components require AiEngineeringProgressProvider.");
  return context;
}

function ProgressBar({ percentage, label }: { percentage: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
    >
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e,#2dd4bf)] transition-[width] duration-300 motion-reduce:transition-none"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function StatusIcon({ status }: { status: AiEngineeringProgressStatus }) {
  if (status === "completed") return <CheckCircle2 size={18} className="shrink-0 text-emerald-700" aria-hidden="true" />;
  if (status === "in-progress") return <Clock3 size={18} className="shrink-0 text-amber-700" aria-hidden="true" />;
  return <Circle size={18} className="shrink-0 text-slate-400" aria-hidden="true" />;
}

function statusLabel(status: AiEngineeringProgressStatus) {
  if (status === "completed") return "Completada";
  if (status === "in-progress") return "En progreso";
  return "Pendiente";
}

function statusTone(status: AiEngineeringProgressStatus) {
  if (status === "completed") return "text-emerald-800";
  if (status === "in-progress") return "text-amber-800";
  return "text-slate-600";
}
