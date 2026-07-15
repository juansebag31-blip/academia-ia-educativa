import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  Clock3,
  Download,
  FileAudio,
  FileImage,
  FileText,
  Library,
  ListChecks,
  PencilLine,
  Presentation,
  Route,
} from "lucide-react";
import { DeferredAudio } from "@/components/deferred-media";
import type { AiEngineeringCourseDefinition, AiEngineeringModule } from "@/lib/courses/types";
import { formatLearningPathLabel } from "@/lib/courses/ai-engineering/learning-path";
import { AiEngineeringCases } from "./ai-engineering-cases";
import { AiEngineeringInfographic } from "./ai-engineering-infographic";
import { SanitizedHtml } from "./sanitized-html";

const navigation = [
  ["contenido", "Contenido"],
  ["infografia", "Infografía"],
  ["audio", "Audio"],
  ["casos", "Casos"],
  ["presentacion", "Presentación"],
  ["actividad", "Actividad"],
  ["autoevaluacion", "Autoevaluación"],
  ["fuentes", "Fuentes"],
] as const;

export function AiEngineeringModulePage({
  course,
  module,
}: {
  course: AiEngineeringCourseDefinition;
  module: AiEngineeringModule;
}) {
  const foundationalSections = module.content.foundational.sections.filter(
    (section) => !["actividad", "evaluacion", "fuentes"].includes(section.id),
  );
  const activity = findSection(module, "actividad");
  const evaluation = findSection(module, "evaluacion");
  const sources = findSection(module, "fuentes");

  return (
    <div className="space-y-7 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-900/50 bg-[#071a2b] text-white shadow-2xl">
        <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_20%_15%,rgba(34,211,238,.28),transparent_30%),linear-gradient(rgba(34,211,238,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.12)_1px,transparent_1px)] [background-size:auto,30px_30px,30px_30px]" />
        <div className="relative p-7 sm:p-10 lg:p-12">
          <Link
            href={`/courses/${course.summary.slug}`}
            className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-bold text-cyan-200 hover:text-white"
          >
            <ArrowLeft size={17} />
            Volver a {course.summary.title}
          </Link>
          <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_360px] xl:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.23em] text-cyan-300">Módulo {module.summary.order}</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
                {module.summary.title}
              </h1>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-slate-200">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2">
                  <Clock3 size={17} className="text-cyan-300" />
                  {module.estimatedStudyMinutes} minutos
                </span>
                <span className="max-w-full break-all rounded-full border border-white/15 bg-white/10 px-4 py-2">
                  Estado: {module.status}
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-cyan-300/25 bg-slate-950/35 p-5">
              <div className="flex items-center gap-2 text-cyan-300">
                <Route size={18} />
                <h2 className="text-sm font-black uppercase tracking-wider">Ruta pedagógica</h2>
              </div>
              <ol className="mt-4 grid grid-cols-2 gap-2">
                {module.learningPath.map((unit) => (
                  <li key={unit.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-slate-100">
                    {unit.order}. {formatLearningPathLabel(unit.sourceKey)}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <nav aria-label="Navegación interna del módulo" className="sticky top-3 z-30 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-card backdrop-blur">
        <ul className="flex min-w-max gap-1">
          {navigation.map(([href, label]) => (
            <li key={href}>
              <a href={`#${href}`} className="focus-ring block rounded-xl px-3 py-2 text-sm font-black text-slate-600 hover:bg-cyan-50 hover:text-cyan-800">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="contenido" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white shadow-card">
        <SectionHeading icon={<BookOpen />} eyebrow="Contenido" title="Documento fundacional" />
        <div className="p-5 sm:p-8">
          {module.content.foundational.introHtml ? (
            <div className="mb-8 rounded-2xl border border-cyan-100 bg-cyan-50/50 p-5 sm:p-7">
              <SanitizedHtml html={module.content.foundational.introHtml} />
            </div>
          ) : null}
          <div className="divide-y divide-slate-200">
            {foundationalSections.map((section) => (
              <article key={section.id} id={section.id} className="scroll-mt-28 py-7 first:pt-0 last:pb-0">
                <SanitizedHtml html={section.html} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <ModuleSection id="infografia" icon={<FileImage />} eyebrow="Infografía" title="De un modelo a un sistema inteligente">
        <AiEngineeringInfographic
          src={module.assets.infographic.publicPath}
          alt="Infografía del Módulo 1 sobre el recorrido de un modelo a un sistema inteligente"
        />
      </ModuleSection>

      <ModuleSection id="audio" icon={<FileAudio />} eyebrow="Audio" title="Audio explicativo">
        <div className="rounded-2xl bg-[#071a2b] p-5 text-white sm:p-6">
          <DeferredAudio
            src={module.assets.audioMp3.publicPath}
            type={module.assets.audioMp3.mediaType}
            title="Audio explicativo del Módulo 1"
          />
        </div>
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-slate-50">
          <summary className="focus-ring cursor-pointer list-none rounded-2xl px-5 py-4 font-black text-slate-800 marker:content-none">
            <span className="flex items-center justify-between gap-3">
              Guion o transcripción
              <span aria-hidden="true" className="text-cyan-700 group-open:rotate-45 motion-reduce:transition-none">+</span>
            </span>
          </summary>
          <pre className="max-h-[34rem] overflow-auto whitespace-pre-wrap border-t border-slate-200 p-5 font-sans text-sm leading-7 text-slate-700">
            {module.content.audioScript}
          </pre>
        </details>
      </ModuleSection>

      <ModuleSection id="casos" icon={<BriefcaseBusiness />} eyebrow="Casos" title="Tres casos reales">
        <AiEngineeringCases cases={module.content.cases} />
      </ModuleSection>

      <ModuleSection id="presentacion" icon={<Presentation />} eyebrow="Presentación" title="Material de presentación">
        <div className="flex flex-col gap-5 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-violet-700 text-white"><FileText /></span>
            <div>
              <p className="font-black text-slate-950">Módulo 1 · Presentación PPTX</p>
              <p className="mt-1 text-sm text-slate-600">Archivo original preparado para el módulo.</p>
            </div>
          </div>
          <a
            href={module.assets.presentation.publicPath}
            download
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-black text-white hover:bg-violet-800"
          >
            <Download size={18} />
            Descargar PPTX
          </a>
        </div>
      </ModuleSection>

      <ModuleSection id="actividad" icon={<PencilLine />} eyebrow="Actividad">
        <SanitizedHtml html={activity.html} />
      </ModuleSection>

      <ModuleSection id="autoevaluacion" icon={<ListChecks />} eyebrow="Autoevaluación">
        <SanitizedHtml html={evaluation.html} />
      </ModuleSection>

      <ModuleSection id="fuentes" icon={<Library />} eyebrow="Fuentes">
        <SanitizedHtml html={sources.html} />
        {module.content.foundational.footerHtml ? (
          <div className="mt-6 border-t border-slate-200 pt-5">
            <SanitizedHtml html={module.content.foundational.footerHtml} />
          </div>
        ) : null}
      </ModuleSection>
    </div>
  );
}

function findSection(module: AiEngineeringModule, id: string) {
  const section = module.content.foundational.sections.find((candidate) => candidate.id === id);
  if (!section) throw new Error(`Missing prepared AI Engineering section: ${id}`);
  return section;
}

function ModuleSection({
  id,
  icon,
  eyebrow,
  title,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  eyebrow: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white shadow-card">
      <SectionHeading icon={icon} eyebrow={eyebrow} title={title} />
      <div className="p-5 sm:p-8">{children}</div>
    </section>
  );
}

function SectionHeading({ icon, eyebrow, title }: { icon: React.ReactNode; eyebrow: string; title?: string }) {
  return (
    <div className="flex items-start gap-4 border-b border-slate-200 p-5 sm:p-7">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800">{icon}</span>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{eyebrow}</p>
        {title ? <h2 className="mt-1 text-2xl font-black text-slate-950">{title}</h2> : null}
      </div>
    </div>
  );
}
