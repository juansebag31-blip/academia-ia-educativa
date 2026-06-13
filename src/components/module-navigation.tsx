import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { CourseModule } from "@/lib/course";

export function ModuleNavigation({
  courseSlug,
  previous,
  next,
}: {
  courseSlug: string;
  previous: CourseModule | null;
  next: CourseModule | null;
}) {
  return (
    <nav
      aria-label="Navegación entre módulos"
      className="grid gap-3 rounded-2xl border border-line-soft bg-white p-4 shadow-card sm:grid-cols-2"
    >
      {previous ? (
        <Link
          href={`/courses/${courseSlug}/modules/${previous.slug}`}
          className="group flex items-center gap-3 rounded-xl border border-line-soft p-4 transition hover:border-blue-200 hover:bg-blue-50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-white group-hover:text-ember">
            <ArrowLeft size={19} />
          </span>
          <span>
            <span className="block text-xs font-black uppercase tracking-wide text-slate-500">Módulo anterior</span>
            <span className="mt-1 block font-black text-ink">{previous.title}</span>
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={`/courses/${courseSlug}/modules/${next.slug}`}
          className="group flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 transition hover:bg-blue-100 sm:text-right"
        >
          <span className="sm:ml-auto">
            <span className="block text-xs font-black uppercase tracking-wide text-ember">Siguiente módulo</span>
            <span className="mt-1 block font-black text-ink">{next.title}</span>
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ember shadow-sm">
            <ArrowRight size={19} />
          </span>
        </Link>
      ) : (
        <div className="flex items-center justify-center rounded-xl bg-emerald-50 p-4 text-sm font-black text-emerald-700 sm:justify-end">
          Has llegado al último módulo
        </div>
      )}
    </nav>
  );
}

