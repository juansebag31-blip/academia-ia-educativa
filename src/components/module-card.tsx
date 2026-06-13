"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText } from "lucide-react";
import type { CourseModule } from "@/lib/course";
import { courseSeed } from "@/lib/course-seed";
import { ModuleImageFrame } from "./module-image-frame";
import { LocalModuleProgress } from "./learning/local-progress";

export function ModuleCard({ courseModule }: { courseModule: CourseModule }) {
  return (
    <Link
      href={`/courses/${courseSeed.slug}/modules/${courseModule.slug}`}
      className="group block overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="relative">
        <ModuleImageFrame image={courseModule.image} className="h-36" />
      </div>
      <div className="-mt-28 h-28 p-4 text-white">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-bold">{courseModule.lessons.length} lecciones</span>
          <span className="rounded-full bg-white p-2 text-ink">
            <FileText size={18} />
          </span>
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-ember">Módulo {courseModule.order}</p>
        <h3 className="mt-2 min-h-14 text-lg font-bold leading-tight text-ink">{courseModule.title.replace(/^Módulo \d+ - /, "")}</h3>
        <p className="mt-3 line-clamp-2 text-sm text-slate-600">{courseModule.purpose}</p>
        <div className="mt-5"><LocalModuleProgress courseModule={courseModule} /></div>
        <div className="mt-5 flex items-center justify-between text-sm font-bold text-ember">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 size={17} />
            Ver módulo
          </span>
          <ArrowRight className="transition group-hover:translate-x-1" size={18} />
        </div>
      </div>
    </Link>
  );
}
