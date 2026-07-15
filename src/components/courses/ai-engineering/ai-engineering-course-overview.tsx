import Link from "next/link";
import { ArrowRight, Clock3, FolderKanban, GraduationCap, Layers3 } from "lucide-react";
import type { AiEngineeringCourseDefinition } from "@/lib/courses/types";
import { AiEngineeringSystemVisual } from "./ai-engineering-system-visual";

const moduleSlots = Array.from({ length: 12 }, (_, index) => index + 1);

export function AiEngineeringCourseOverview({ course }: { course: AiEngineeringCourseDefinition }) {
  const firstModule = course.modules[0];
  const moduleHref = `/courses/${course.summary.slug}/modules/${firstModule.summary.slug}`;

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl border border-[#0f766e]/20 bg-[linear-gradient(135deg,#ffffff_0%,#f3f7f6_58%,#e8f5f2_100%)] shadow-[0_24px_70px_rgba(11,31,51,0.10)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0b1f33,#0f766e,#2dd4bf)]" />
        <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:p-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#0f766e]/20 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">
              <GraduationCap size={16} />
              Curso profesional
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.03] tracking-tight text-[#0b1f33] sm:text-5xl lg:text-6xl">
              {course.summary.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-700">
              Curso gratuito y profesional orientado a AI Engineering, sistemas inteligentes y procesos productivos.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5 text-sm font-bold text-slate-700">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2">
                <Layers3 size={17} className="text-[#0f766e]" />
                Módulo 1
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2">
                <Clock3 size={17} className="text-[#0f766e]" />
                120 minutos
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2">
                <GraduationCap size={17} className="text-[#0f766e]" />
                Nivel fundacional
              </span>
            </div>

            <Link
              href={moduleHref}
              className="focus-ring mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-950/15 hover:bg-[#0b5f59]"
            >
              Comenzar Módulo 1
              <ArrowRight size={18} />
            </Link>
          </div>

          <AiEngineeringSystemVisual />
        </div>
      </section>

      <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8 lg:grid-cols-[auto_1fr] lg:items-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-[#0b1f33] text-[#5eead4]">
          <FolderKanban size={28} />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">Proyecto transversal</p>
          <h2 className="mt-1 text-2xl font-black text-[#0b1f33]">JSG AI Engineering Hub v0.1</h2>
          <p className="mt-2 max-w-4xl leading-7 text-slate-600">
            Convertir información dispersa en conocimiento organizado, decisiones y próximos pasos verificables.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">Programa</p>
            <h2 className="mt-1 text-2xl font-black text-[#0b1f33]">Recorrido de 12 módulos</h2>
          </div>
          <p className="text-sm font-semibold text-slate-500">1 disponible · 11 próximamente</p>
        </div>

        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {moduleSlots.map((moduleNumber) => {
            const isAvailable = moduleNumber === 1;
            const content = (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-black text-[#0f766e]">{String(moduleNumber).padStart(2, "0")}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                    {isAvailable ? "Disponible" : "Próximamente"}
                  </span>
                </div>
                <p className="mt-4 font-black text-[#0b1f33]">Módulo {moduleNumber}</p>
                {isAvailable ? <p className="mt-1 text-sm leading-6 text-slate-600">{firstModule.summary.title}</p> : null}
              </>
            );

            return (
              <li key={moduleNumber}>
                {isAvailable ? (
                  <Link href={moduleHref} className="focus-ring block min-h-32 rounded-2xl border border-[#0f766e]/30 bg-[#f3f7f6] p-4 transition hover:border-[#0f766e] hover:bg-[#e8f5f2] motion-reduce:transition-none">
                    {content}
                  </Link>
                ) : (
                  <div className="min-h-32 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
