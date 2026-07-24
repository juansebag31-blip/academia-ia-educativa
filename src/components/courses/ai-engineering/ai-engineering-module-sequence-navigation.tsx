import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import type {
  AiEngineeringCourseDefinition,
  AiEngineeringModule,
} from "@/lib/courses/types";

export function AiEngineeringModuleSequenceNavigation({
  course,
  module,
}: {
  course: AiEngineeringCourseDefinition;
  module: AiEngineeringModule;
}) {
  const publishedModules = course.modules
    .filter((candidate) => candidate.publish)
    .slice()
    .sort((left, right) => left.summary.order - right.summary.order);
  const currentIndex = publishedModules.findIndex(
    (candidate) => candidate.summary.slug === module.summary.slug,
  );
  const previousModule = currentIndex > 0 ? publishedModules[currentIndex - 1] : undefined;
  const nextModule = currentIndex >= 0 ? publishedModules[currentIndex + 1] : undefined;
  const courseHref = `/courses/${course.summary.slug}`;

  return (
    <nav
      aria-label="Continuidad del curso"
      className="overflow-hidden rounded-3xl border border-[#0f766e]/20 bg-white shadow-card"
    >
      <div className="border-b border-[#0f766e]/15 bg-[linear-gradient(135deg,#0b1f33,#0f3f4a)] px-5 py-5 text-white sm:px-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5eead4]">
          Continuar aprendiendo
        </p>
        <h2 className="mt-1 text-xl font-black">Recorrido de AI Engineering Aplicado</h2>
      </div>

      <div className="grid gap-3 p-4 sm:p-6 md:grid-cols-3">
        <div className="min-w-0">
          {previousModule ? (
            <ModuleLink
              href={`${courseHref}/modules/${previousModule.summary.slug}`}
              eyebrow={`Módulo ${previousModule.summary.order}`}
              title={previousModule.summary.title}
              direction="previous"
            />
          ) : (
            <div className="flex h-full min-h-28 items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">
              Este es el primer módulo del recorrido.
            </div>
          )}
        </div>

        <Link
          href={courseHref}
          className="focus-ring flex min-h-28 items-center justify-center gap-3 rounded-2xl border border-[#0f766e]/20 bg-[#e8f5f2] p-4 text-center font-black text-[#0b1f33] transition hover:border-[#0f766e]/45 hover:bg-[#dff3ef] motion-reduce:transition-none"
        >
          <GraduationCap className="shrink-0 text-[#0f766e]" aria-hidden="true" />
          <span>Volver a la portada del curso</span>
        </Link>

        <div className="min-w-0">
          {nextModule ? (
            <ModuleLink
              href={`${courseHref}/modules/${nextModule.summary.slug}`}
              eyebrow={`Módulo ${nextModule.summary.order}`}
              title={nextModule.summary.title}
              direction="next"
            />
          ) : (
            <div
              role="status"
              className="flex h-full min-h-28 items-center justify-center gap-3 rounded-2xl border border-[#0f766e]/20 bg-[#0f766e] p-4 text-center font-black text-white"
            >
              <CheckCircle2 className="shrink-0 text-[#99f6e4]" aria-hidden="true" />
              <span>Curso completado</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function ModuleLink({
  href,
  eyebrow,
  title,
  direction,
}: {
  href: string;
  eyebrow: string;
  title: string;
  direction: "previous" | "next";
}) {
  const Icon = direction === "previous" ? ArrowLeft : ArrowRight;
  const label = direction === "previous" ? "Módulo anterior" : "Siguiente módulo";

  return (
    <Link
      href={href}
      aria-label={`${label}: ${title}`}
      className="focus-ring group flex h-full min-h-28 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-[#0b1f33] transition hover:border-[#0f766e]/45 hover:bg-[#f3f7f6] motion-reduce:transition-none"
    >
      {direction === "previous" ? (
        <Icon className="shrink-0 text-[#0f766e]" aria-hidden="true" />
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#0f766e]">
          {eyebrow} · {label}
        </span>
        <span className="mt-1 block text-sm font-black leading-5">{title}</span>
      </span>
      {direction === "next" ? (
        <Icon className="shrink-0 text-[#0f766e]" aria-hidden="true" />
      ) : null}
    </Link>
  );
}
