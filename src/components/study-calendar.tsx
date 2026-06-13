"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock, Sparkles, type LucideIcon } from "lucide-react";
import type { CourseSeed } from "@/lib/course";
import { addDays, buildMonthGrid, getSuggestedModuleOrderForDate, toIsoDate } from "@/lib/study-calendar";

type StudyLog = {
  moduleSlug: string;
  topic: string;
  learned: string;
  minutes: string;
};

type StudyLogs = Record<string, StudyLog>;

const storageKey = "academia-ia-study-calendar";
const startStorageKey = "academia-ia-study-calendar-start";
const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const monthFormatter = new Intl.DateTimeFormat("es", { month: "long", year: "numeric" });
const longDateFormatter = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" });

export function StudyCalendar({ course }: { course: CourseSeed }) {
  const todayIso = toIsoDate(new Date());
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedIso, setSelectedIso] = useState(todayIso);
  const [courseStartIso, setCourseStartIso] = useState(todayIso);
  const [logs, setLogs] = useState<StudyLogs>({});

  useEffect(() => {
    const savedStart = window.localStorage.getItem(startStorageKey);
    const savedLogs = window.localStorage.getItem(storageKey);

    if (savedStart) {
      setCourseStartIso(savedStart);
    }
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs) as StudyLogs);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    window.localStorage.setItem(startStorageKey, courseStartIso);
  }, [courseStartIso]);

  const days = useMemo(() => buildMonthGrid(visibleMonth.getFullYear(), visibleMonth.getMonth()), [visibleMonth]);
  const selectedModuleOrder = getSuggestedModuleOrderForDate(selectedIso, courseStartIso, course.modules.length);
  const suggestedModule = selectedModuleOrder ? course.modules.find((courseModule) => courseModule.order === selectedModuleOrder) : null;
  const selectedLog = logs[selectedIso] ?? {
    moduleSlug: suggestedModule?.slug ?? course.modules[0]?.slug ?? "",
    topic: "",
    learned: "",
    minutes: "",
  };
  const completedDays = Object.values(logs).filter((log) => log.topic.trim() || log.learned.trim()).length;
  const totalMinutes = Object.values(logs).reduce((total, log) => total + (Number(log.minutes) || 0), 0);

  function updateLog(update: Partial<StudyLog>) {
    setLogs((current) => ({
      ...current,
      [selectedIso]: {
        ...selectedLog,
        ...update,
      },
    }));
  }

  function moveMonth(amount: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  function selectWeekStart(weekIndex: number) {
    const iso = addDays(courseStartIso, weekIndex * 7);
    const [year, month] = iso.split("-").map(Number);
    setSelectedIso(iso);
    setVisibleMonth(new Date(year, month - 1, 1));
  }

  return (
    <div className="space-y-7">
      <header className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-ember">Planificador personal</p>
          <h1 className="mt-2 text-3xl font-black">Calendario de estudio</h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Registra qué estudias cada día, qué aprendiste y a qué módulo pertenece. La semana sugerida conecta automáticamente el calendario con los 11 módulos del curso.
          </p>
        </div>
        <div className="rounded-2xl border border-line-soft bg-white p-5 shadow-card">
          <label className="text-xs font-black uppercase tracking-wide text-slate-500" htmlFor="course-start">
            Inicio de tu ruta
          </label>
          <input
            id="course-start"
            type="date"
            value={courseStartIso}
            onChange={(event) => setCourseStartIso(event.target.value)}
            className="mt-2 w-full rounded-xl border border-line-soft bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-300"
          />
          <p className="mt-3 text-xs leading-5 text-slate-500">Desde esta fecha se calcula Semana 1, Semana 2 y el módulo recomendado para cada día.</p>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="rounded-2xl border border-line-soft bg-white p-5 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black capitalize">{monthFormatter.format(visibleMonth)}</h2>
              <p className="mt-1 text-sm text-slate-500">Selecciona un día y anota tu avance.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line-soft bg-white text-slate-600 transition hover:bg-blue-50 hover:text-ember"
                aria-label="Mes anterior"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                  setSelectedIso(todayIso);
                }}
                className="rounded-xl border border-line-soft bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-blue-50 hover:text-ember"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line-soft bg-white text-slate-600 transition hover:bg-blue-50 hover:text-ember"
                aria-label="Mes siguiente"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-black uppercase tracking-wide text-slate-400">
            {weekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2">
            {days.map((day) => {
              const moduleOrder = getSuggestedModuleOrderForDate(day.iso, courseStartIso, course.modules.length);
              const hasLog = Boolean(logs[day.iso]?.topic.trim() || logs[day.iso]?.learned.trim());
              const isSelected = selectedIso === day.iso;
              const isToday = todayIso === day.iso;

              return (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => setSelectedIso(day.iso)}
                  className={`min-h-24 rounded-2xl border p-2 text-left transition ${
                    isSelected
                      ? "border-blue-400 bg-blue-50 shadow-card"
                      : day.inCurrentMonth
                        ? "border-line-soft bg-slate-50 hover:border-blue-200 hover:bg-blue-50"
                        : "border-slate-100 bg-white text-slate-300"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${isToday ? "bg-ink text-white" : "bg-white text-slate-700"}`}>
                      {day.dayNumber}
                    </span>
                    {hasLog ? <CheckCircle2 size={16} className="text-emerald-600" /> : null}
                  </span>
                  {moduleOrder ? (
                    <span className="mt-3 inline-flex rounded-full bg-white px-2 py-1 text-[10px] font-black text-ember shadow-sm">Mód. {moduleOrder}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-line-soft bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-ember">Día seleccionado</p>
                <h2 className="mt-1 text-xl font-black capitalize">{longDateFormatter.format(parseIso(selectedIso))}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {suggestedModule ? `Semana ${selectedModuleOrder}: ${suggestedModule.title}` : "Fuera de las 11 semanas sugeridas. Puedes registrar repaso o práctica libre."}
                </p>
              </div>
              <span className="rounded-2xl bg-blue-50 p-3 text-ember">
                <CalendarDays size={24} />
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-black text-slate-700">Módulo asociado</span>
                <select
                  value={selectedLog.moduleSlug}
                  onChange={(event) => updateLog({ moduleSlug: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-line-soft bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-300"
                >
                  {course.modules.map((courseModule) => (
                    <option key={courseModule.slug} value={courseModule.slug}>
                      Módulo {courseModule.order} · {courseModule.title.replace(/^Módulo \d+ - /, "")}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-700">Tema estudiado</span>
                <input
                  value={selectedLog.topic}
                  onChange={(event) => updateLog({ topic: event.target.value })}
                  placeholder="Ejemplo: historia de la IA y línea de tiempo"
                  className="mt-2 w-full rounded-xl border border-line-soft bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-700">Qué aprendí hoy</span>
                <textarea
                  value={selectedLog.learned}
                  onChange={(event) => updateLog({ learned: event.target.value })}
                  placeholder="Escribe una síntesis breve, una duda, una idea o una evidencia producida."
                  className="mt-2 min-h-36 w-full resize-y rounded-xl border border-line-soft bg-slate-50 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-300"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-700">Tiempo dedicado</span>
                <input
                  value={selectedLog.minutes}
                  onChange={(event) => updateLog({ minutes: event.target.value.replace(/[^0-9]/g, "") })}
                  placeholder="Minutos"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border border-line-soft bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300"
                />
              </label>

              {selectedLog.moduleSlug ? (
                <Link
                  href={`/courses/${course.slug}/modules/${selectedLog.moduleSlug}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ember px-5 py-3 text-sm font-bold text-white transition hover:bg-ember-dark"
                >
                  Ir al módulo asociado
                  <ArrowRight size={17} />
                </Link>
              ) : null}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <StatCard icon={CheckCircle2} label="Días con registro" value={completedDays.toString()} />
            <StatCard icon={Clock} label="Tiempo total" value={`${totalMinutes} min`} />
          </section>
        </aside>
      </section>

      <section className="rounded-2xl border border-line-soft bg-white p-6 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-ember">Ruta sugerida</p>
            <h2 className="mt-1 text-2xl font-black">11 semanas, 11 módulos</h2>
            <p className="mt-2 text-sm text-slate-600">Toca una semana para llevar el calendario al inicio de esa etapa.</p>
          </div>
          <Sparkles className="text-ember" size={26} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {course.modules.map((courseModule, index) => {
            const weekStart = addDays(courseStartIso, index * 7);
            const weekEnd = addDays(weekStart, 6);

            return (
              <button
                key={courseModule.slug}
                type="button"
                onClick={() => selectWeekStart(index)}
                className="group rounded-2xl border border-line-soft bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-xl bg-white px-3 py-2 text-xs font-black text-ember shadow-sm">Semana {index + 1}</span>
                  <ArrowRight size={17} className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-ember" />
                </div>
                <h3 className="mt-3 font-black leading-6 text-ink">{courseModule.title}</h3>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {formatShortDate(weekStart)} - {formatShortDate(weekEnd)}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{courseModule.product}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line-soft bg-white p-4 shadow-card">
      <Icon className="text-ember" size={20} />
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-ink">{value}</p>
    </div>
  );
}

function parseIso(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatShortDate(iso: string) {
  const date = parseIso(iso);

  return new Intl.DateTimeFormat("es", { day: "2-digit", month: "short" }).format(date);
}

