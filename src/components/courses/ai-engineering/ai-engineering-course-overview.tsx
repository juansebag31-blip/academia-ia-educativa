import {
  ArrowRight,
  Blocks,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  FolderKanban,
  GraduationCap,
  Layers3,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import type { AiEngineeringCourseDefinition } from "@/lib/courses/types";
import { AiEngineeringCourseCatalog } from "./ai-engineering-course-catalog";
import { AiEngineeringCourseProgressCta } from "./ai-engineering-progress";
import { AiEngineeringSystemVisual } from "./ai-engineering-system-visual";

const learningOutcomes = [
  {
    icon: Blocks,
    title: "Diseñar sistemas completos",
    description: "Pasar del modelo aislado a arquitecturas con contexto, datos, herramientas y control humano.",
  },
  {
    icon: DatabaseZap,
    title: "Conectar conocimiento y acciones",
    description: "Integrar RAG, APIs, function calling, MCP, memoria, workflows y agentes con propósito.",
  },
  {
    icon: ShieldCheck,
    title: "Evaluar y proteger",
    description: "Aplicar observabilidad, trazabilidad, guardrails, supervisión y criterios de confiabilidad.",
  },
  {
    icon: Rocket,
    title: "Llevar IA a producción",
    description: "Equilibrar coste, velocidad y calidad para convertir una solución técnica en producto.",
  },
] as const;

const coursePhases = [
  {
    number: "01",
    modules: "Módulos 1–3",
    title: "Fundamentos del sistema",
    description: "Modelo, selección, contexto, estado y memoria.",
  },
  {
    number: "02",
    modules: "Módulos 4–7",
    title: "Construcción y orquestación",
    description: "Herramientas, RAG, workflows, agentes y coordinación.",
  },
  {
    number: "03",
    modules: "Módulos 8–10",
    title: "Calidad operacional",
    description: "Evaluación, seguridad, trazabilidad, coste y confiabilidad.",
  },
  {
    number: "04",
    modules: "Módulos 11–12",
    title: "Producto y producción",
    description: "Automatización empresarial y proyecto final integrador.",
  },
] as const;

export function AiEngineeringCourseOverview({ course }: { course: AiEngineeringCourseDefinition }) {
  const availableCount = course.curriculum.filter((module) => module.editorialStatus === "approved" && module.publish).length;
  const totalMinutes = course.modules.reduce((total, module) => total + module.estimatedStudyMinutes, 0);
  const totalHours = Math.round(totalMinutes / 60);

  return (
    <div className="space-y-8 pb-12">
      <section
        id="portada"
        className="scroll-mt-24 relative overflow-hidden rounded-[2rem] border border-[#2dd4bf]/20 bg-[#071a2b] text-white shadow-[0_28px_90px_rgba(7,26,43,0.22)]"
      >
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(45,212,191,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,.08)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute -right-20 -top-28 size-80 rounded-full bg-[#0f766e]/30 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-[#2dd4bf]/15 blur-3xl" />

        <div className="relative grid gap-9 p-6 sm:p-9 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:p-12 xl:p-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#5eead4]/25 bg-[#0f766e]/20 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-[#99f6e4]">
              <GraduationCap size={16} aria-hidden="true" />
              Itinerario profesional completo
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              {course.summary.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-200 sm:text-xl">
              Diseña, evalúa y lleva a producción sistemas inteligentes que combinan modelos, conocimiento, herramientas y supervisión humana.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5 text-sm font-bold text-slate-100">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2">
                <Layers3 size={17} className="text-[#5eead4]" aria-hidden="true" />
                12 módulos
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2">
                <Clock3 size={17} className="text-[#5eead4]" aria-hidden="true" />
                {totalHours} horas estimadas
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2">
                <FolderKanban size={17} className="text-[#5eead4]" aria-hidden="true" />
                Proyecto transversal
              </span>
            </div>

            <AiEngineeringCourseProgressCta course={course} />
          </div>

          <AiEngineeringSystemVisual variant="hero" />
        </div>
      </section>

      <section
        id="resultados"
        aria-labelledby="resultados-title"
        className="scroll-mt-24 rounded-[2rem] border border-[#0f766e]/15 bg-white p-6 shadow-[0_18px_60px_rgba(11,31,51,0.08)] sm:p-8 lg:p-10"
      >
        <SectionIntro
          eyebrow="Resultados de aprendizaje"
          title="Capacidades para construir IA con criterio profesional"
          description="El recorrido conecta decisiones de arquitectura, implementación, evaluación y producto en una misma práctica."
          titleId="resultados-title"
        />
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {learningOutcomes.map((outcome) => {
            const Icon = outcome.icon;
            return (
              <article key={outcome.title} className="rounded-2xl border border-slate-200 bg-[#f7faf9] p-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#dff3ef] text-[#0f766e]">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-black text-[#0b1f33]">{outcome.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{outcome.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        id="arquitectura"
        aria-labelledby="arquitectura-title"
        className="scroll-mt-24 overflow-hidden rounded-[2rem] border border-[#0f766e]/15 bg-[linear-gradient(135deg,#eef7f5,#ffffff)] p-6 shadow-[0_18px_60px_rgba(11,31,51,0.08)] sm:p-8 lg:p-10"
      >
        <SectionIntro
          eyebrow="Arquitectura del curso"
          title="Cuatro etapas, una progresión técnica"
          description="La complejidad aumenta solo cuando existe una capacidad concreta que aprender, evaluar y justificar."
          titleId="arquitectura-title"
        />
        <ol className="mt-8 grid gap-4 lg:grid-cols-4">
          {coursePhases.map((phase, index) => (
            <li key={phase.number} className="relative rounded-2xl border border-[#0f766e]/20 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs font-black text-[#0f766e]">{phase.number}</span>
                <span className="rounded-full bg-[#e8f5f2] px-3 py-1 text-[11px] font-black text-[#0f766e]">{phase.modules}</span>
              </div>
              <h3 className="mt-5 text-lg font-black text-[#0b1f33]">{phase.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{phase.description}</p>
              {index < coursePhases.length - 1 ? (
                <span className="absolute -right-3 top-1/2 z-10 hidden size-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#0f766e] text-white lg:flex" aria-hidden="true">
                  <ArrowRight size={14} />
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section
        id="proyecto"
        aria-labelledby="proyecto-title"
        className="scroll-mt-24 overflow-hidden rounded-[2rem] border border-[#2dd4bf]/25 bg-[#0b1f33] text-white shadow-[0_20px_70px_rgba(7,26,43,0.18)]"
      >
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:p-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5eead4]">Proyecto transversal</p>
            <h2 id="proyecto-title" className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              JSG AI Engineering Hub v1.0
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
              El proyecto conecta los doce módulos en una arquitectura verificable: conocimiento organizado, orquestación controlada, evaluación continua y aprobación humana.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#5eead4]/25 bg-[#0f766e]/20 px-4 py-3 text-sm font-black text-[#99f6e4]">
              <CheckCircle2 size={18} aria-hidden="true" />
              Evolución completa de v0.1 a v1.0
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2" role="img" aria-label="Capas del proyecto JSG AI Engineering Hub">
            <ProjectLayer number="01" title="Experiencia" description="Usuario, interfaz y propósito." />
            <ProjectLayer number="02" title="Conocimiento" description="Contexto, RAG, estado y memoria." />
            <ProjectLayer number="03" title="Orquestación" description="Herramientas, workflows y agentes." />
            <ProjectLayer number="04" title="Confianza" description="Evaluación, seguridad y supervisión." />
          </div>
        </div>
      </section>

      <section
        id="programa"
        aria-labelledby="programa-title"
        className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(11,31,51,0.08)] sm:p-8 lg:p-10"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionIntro
            eyebrow="Programa"
            title="Recorrido completo de 12 módulos"
            description="Cada módulo conserva su progreso, materiales y actividades de manera independiente."
            titleId="programa-title"
          />
          <p className="shrink-0 rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">
            {availableCount} disponibles · {course.curriculum.length - availableCount} próximos
          </p>
        </div>

        <AiEngineeringCourseCatalog course={course} />
      </section>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  titleId,
}: {
  eyebrow: string;
  title: string;
  description: string;
  titleId: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">{eyebrow}</p>
      <h2 id={titleId} className="mt-2 text-2xl font-black tracking-tight text-[#0b1f33] sm:text-3xl">{title}</h2>
      <p className="mt-3 leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function ProjectLayer({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#0f766e] text-white">
          <BrainCircuit size={20} aria-hidden="true" />
        </span>
        <span className="font-mono text-xs font-black text-[#5eead4]">{number}</span>
      </div>
      <h3 className="mt-4 font-black text-white">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
