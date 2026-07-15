import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Layers3, Route } from "lucide-react";
import type { AiEngineeringCourseDefinition } from "@/lib/courses/types";
import { formatLearningPathLabel } from "@/lib/courses/ai-engineering/learning-path";

export function AiEngineeringCourseOverview({ course }: { course: AiEngineeringCourseDefinition }) {
  const firstModule = course.modules[0];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-900/50 bg-[#071a2b] text-white shadow-2xl">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(34,211,238,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.15)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative grid lg:grid-cols-[1.08fr_.92fr]">
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Curso · Versión {course.sourceVersion}</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {course.summary.title}
            </h1>
            <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-slate-200">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2">
                <Layers3 size={17} className="text-cyan-300" />
                {course.summary.modules.length} módulo
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2">
                <Clock3 size={17} className="text-cyan-300" />
                {course.summary.duration}
              </span>
            </div>
            <Link
              href={`/courses/${course.summary.slug}/modules/${firstModule.summary.slug}`}
              className="focus-ring mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200"
            >
              Abrir Módulo 1
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="relative min-h-[420px] border-t border-white/10 bg-slate-950/35 lg:border-l lg:border-t-0">
            <Image
              src={firstModule.assets.infographic.publicPath}
              alt="Infografía del Módulo 1: de un modelo a un sistema inteligente"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 44vw"
              className="object-contain p-6"
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-center gap-3">
          <Route className="text-cyan-700" />
          <h2 className="text-2xl font-black text-slate-950">Ruta pedagógica</h2>
        </div>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {firstModule.learningPath.map((unit) => (
            <li key={unit.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-black text-cyan-700">{String(unit.order).padStart(2, "0")}</span>
              <p className="mt-1 font-bold text-slate-800">{formatLearningPathLabel(unit.sourceKey)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Módulo {firstModule.summary.order}</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-950">{firstModule.summary.title}</h2>
            <p className="mt-3 text-sm font-bold text-slate-500">Estado: {firstModule.status}</p>
          </div>
          <Link
            href={`/courses/${course.summary.slug}/modules/${firstModule.summary.slug}`}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-[#071a2b] px-5 py-3 text-sm font-black text-white hover:bg-[#0f2940]"
          >
            Ver módulo completo
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
