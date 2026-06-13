import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, ClipboardList } from "lucide-react";
import { ProgressBar } from "@/components/progress-bar";
import { calculateCourseProgress, getModuleProgress } from "@/lib/course";
import { courseSeed } from "@/lib/course-seed";
import { getProgressForCourse } from "@/lib/progress";

export default function ModulesPage() {
  const progressEntries = getProgressForCourse();
  const completedSlugs = new Set(progressEntries.filter((entry) => entry.status === "completed").map((entry) => entry.lessonSlug));
  const courseProgress = calculateCourseProgress(progressEntries);

  return (
    <div className="space-y-7">
      <section className="rounded-2xl border border-line-soft bg-white p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-ember">Acceso rápido</p>
            <h1 className="mt-2 text-3xl font-black text-ink">Módulos del curso</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Panel directo para entrar a cualquiera de los 11 módulos, revisar el avance y continuar con el examen o las lecciones.
            </p>
          </div>
          <div className="min-w-full rounded-xl bg-slate-50 p-4 lg:min-w-72">
            <div className="flex items-center justify-between text-sm font-bold text-slate-600">
              <span>Progreso general</span>
              <span>{courseProgress.percent}%</span>
            </div>
            <div className="mt-3">
              <ProgressBar percent={courseProgress.percent} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {courseSeed.modules.map((courseModule) => {
          const moduleProgress = getModuleProgress(courseModule, completedSlugs);

          return (
            <Link
              key={courseModule.slug}
              href={`/courses/${courseSeed.slug}/modules/${courseModule.slug}`}
              className="group grid overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-soft sm:grid-cols-[180px_minmax(0,1fr)]"
            >
              <div className="relative min-h-40 bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={courseModule.image.src} alt="" className="h-full w-full object-cover" loading="lazy" />
                <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-black text-white">
                  Módulo {courseModule.order}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black leading-tight text-ink">{courseModule.title.replace(/^Módulo \d+ - /, "")}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{courseModule.purpose}</p>
                  </div>
                  <ArrowRight className="mt-1 shrink-0 text-ember transition group-hover:translate-x-1" size={22} />
                </div>

                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <BookOpen className="text-ember" size={18} />
                    <p className="mt-2 font-bold">{courseModule.lessons.length} lecciones</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <ClipboardList className="text-ember" size={18} />
                    <p className="mt-2 font-bold">Examen 80%</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <CheckCircle2 className="text-ember" size={18} />
                    <p className="mt-2 font-bold">{moduleProgress.percent}% completo</p>
                  </div>
                </div>

                <div className="mt-5">
                  <ProgressBar percent={moduleProgress.percent} />
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
