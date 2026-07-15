import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
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
} from "lucide-react";
import { DeferredAudio } from "@/components/deferred-media";
import type { AiEngineeringCourseDefinition, AiEngineeringModule } from "@/lib/courses/types";
import { AiEngineeringActivity } from "./ai-engineering-activity";
import { AiEngineeringCases } from "./ai-engineering-cases";
import { AiEngineeringInfographic } from "./ai-engineering-infographic";
import { AiEngineeringSelfAssessment } from "./ai-engineering-self-assessment";
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
      <section className="relative overflow-hidden rounded-3xl border border-[#0f766e]/20 bg-[linear-gradient(135deg,#ffffff_0%,#f3f7f6_62%,#e8f5f2_100%)] shadow-[0_20px_60px_rgba(11,31,51,0.10)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0b1f33,#0f766e,#2dd4bf)]" />
        <div className="relative p-6 sm:p-8 lg:p-10">
          <Link
            href={`/courses/${course.summary.slug}`}
            className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-bold text-[#0f766e] hover:text-[#0b1f33]"
          >
            <ArrowLeft size={17} />
            Volver a {course.summary.title}
          </Link>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#0f766e]">
                <span>Módulo {module.summary.order}</span>
                <span aria-hidden="true">·</span>
                <span>Nivel fundacional</span>
              </div>
              <h1 className="mt-3 max-w-4xl text-3xl font-black leading-[1.08] tracking-tight text-[#0b1f33] sm:text-4xl lg:text-5xl">
                {module.summary.title}
              </h1>
              <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-slate-700">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2">
                  <Clock3 size={17} className="text-[#0f766e]" />
                  {module.estimatedStudyMinutes} minutos
                </span>
              </div>
            </div>
            <a
              href="#contenido"
              className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-950/15 hover:bg-[#0b5f59] sm:w-fit"
            >
              Comenzar módulo
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      <details className="group sticky top-3 z-30 rounded-2xl border border-slate-200 bg-white/95 shadow-card backdrop-blur">
        <summary className="focus-ring cursor-pointer list-none rounded-2xl px-5 py-4 font-black text-[#0b1f33] marker:content-none">
          <span className="flex items-center justify-between gap-4">
            Recorrido del módulo · 8 etapas
            <span aria-hidden="true" className="text-xl text-[#0f766e] group-open:rotate-45 motion-reduce:transition-none">+</span>
          </span>
        </summary>
        <nav aria-label="Navegación interna del módulo" className="border-t border-slate-200 p-3">
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {navigation.map(([href, label], index) => (
              <li key={href}>
                <a href={`#${href}`} className="focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-slate-600 hover:bg-[#e8f5f2] hover:text-[#0f766e]">
                  <span className="font-mono text-xs text-[#0f766e]">{String(index + 1).padStart(2, "0")}</span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </details>

      <section id="contenido" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white shadow-card">
        <SectionHeading icon={<BookOpen />} eyebrow="Contenido" title="Documento fundacional" />
        <div className="p-5 sm:p-8">
          {module.content.foundational.introHtml ? (
            <div className="mb-8 rounded-2xl border border-[#0f766e]/20 bg-[#f3f7f6] p-5 sm:p-7">
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
        <div className="rounded-2xl bg-[#0b1f33] p-5 text-white sm:p-6">
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
              <span aria-hidden="true" className="text-[#0f766e] group-open:rotate-45 motion-reduce:transition-none">+</span>
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
        <div className="flex flex-col gap-5 rounded-2xl border border-[#0f766e]/20 bg-[#f3f7f6] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#0b1f33] text-white"><FileText /></span>
            <div>
              <p className="font-black text-slate-950">Módulo 1 · Presentación PPTX</p>
              <p className="mt-1 text-sm text-slate-600">Archivo original preparado para el módulo.</p>
            </div>
          </div>
          <a
            href={module.assets.presentation.publicPath}
            download
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-5 py-3 text-sm font-black text-white hover:bg-[#0b5f59]"
          >
            <Download size={18} />
            Descargar PPTX
          </a>
        </div>
      </ModuleSection>

      <ModuleSection id="actividad" icon={<PencilLine />} eyebrow="Actividad">
        <AiEngineeringActivity
          courseSlug={course.summary.slug}
          moduleSlug={module.summary.slug}
          sourceHtml={activity.html}
        />
      </ModuleSection>

      <ModuleSection id="autoevaluacion" icon={<ListChecks />} eyebrow="Autoevaluación">
        <AiEngineeringSelfAssessment
          courseSlug={course.summary.slug}
          moduleSlug={module.summary.slug}
          sourceHtml={evaluation.html}
        />
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
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#dff3ef] text-[#0f766e]">{icon}</span>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">{eyebrow}</p>
        {title ? <h2 className="mt-1 text-2xl font-black text-slate-950">{title}</h2> : null}
      </div>
    </div>
  );
}
