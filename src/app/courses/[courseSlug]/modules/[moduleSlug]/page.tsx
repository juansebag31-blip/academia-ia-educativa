import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Award, CheckCircle2, FileText, Video } from "lucide-react";
import { ActiveLearningPanel } from "@/components/active-learning-panel";
import { ModuleExamCallout } from "@/components/module-exam-callout";
import { ModuleImageFrame } from "@/components/module-image-frame";
import { ModuleInfographic } from "@/components/module-infographic";
import { ModuleNavigation } from "@/components/module-navigation";
import { ModuleResourceLibrary } from "@/components/module-resource-library";
import { ModuleSourceDocument } from "@/components/module-source-document";
import { ProgressBar } from "@/components/progress-bar";
import { VideoPlayer } from "@/components/video-player";
import { findAdjacentModules, findModuleBySlug, getModuleProgress } from "@/lib/course";
import { courseSeed } from "@/lib/course-seed";
import { getLatestExamAttempt } from "@/lib/exam-data";
import { getCompletedLessonSlugs } from "@/lib/progress";
import { getModuleResourceBundle } from "@/lib/module-resource-bundles";

export default async function ModulePage({ params }: { params: Promise<{ courseSlug: string; moduleSlug: string }> }) {
  const { courseSlug, moduleSlug } = await params;

  if (courseSlug !== courseSeed.slug) {
    notFound();
  }

  const courseModule = findModuleBySlug(courseSeed, moduleSlug);
  if (!courseModule) {
    notFound();
  }

  const completedSlugs = getCompletedLessonSlugs();
  const progress = getModuleProgress(courseModule, completedSlugs);
  const latestAttempt = getLatestExamAttempt(courseModule.slug);
  const resourceBundle = getModuleResourceBundle(courseModule.slug);
  const adjacentModules = findAdjacentModules(courseSeed, courseModule.slug);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-line-soft bg-white p-7 shadow-card">
        <div className="mb-7 overflow-hidden rounded-2xl">
          <ModuleImageFrame image={courseModule.image} className="h-64" zoomable />
        </div>
        <div className="grid gap-7 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-ember">Módulo {courseModule.order}</p>
            <h1 className="mt-3 text-3xl font-black leading-tight">{courseModule.title}</h1>
            <p className="mt-4 max-w-3xl text-slate-600">{courseModule.purpose}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#material-fuente"
                className="inline-flex items-center gap-2 rounded-xl border border-line-soft px-5 py-3 text-sm font-bold hover:bg-slate-50"
              >
                <FileText size={18} />
                Ver PDF del módulo
              </a>
              <Link
                href={`/courses/${courseSeed.slug}/lessons/${courseModule.lessons[0].slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-ember px-5 py-3 text-sm font-bold text-white hover:bg-ember-dark"
              >
                Empezar módulo
                <ArrowRight size={18} />
              </Link>
              <Link
                href={`/courses/${courseSeed.slug}/modules/${courseModule.slug}/exam`}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                <Award size={18} />
                Examen del módulo
              </Link>
            </div>
          </div>
          <aside className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-500">Producto esperado</p>
            <p className="mt-2 text-lg font-black">{courseModule.product}</p>
            {latestAttempt && (
              <div className={`mt-5 rounded-xl p-4 ${latestAttempt.passed ? "bg-emerald-50 text-emerald-800" : "bg-blue-50 text-blue-800"}`}>
                <p className="text-sm font-black">{latestAttempt.passed ? "Certificado aprobado" : "Último examen no aprobado"}</p>
                <p className="text-sm">
                  {latestAttempt.percent}% · {latestAttempt.correct}/{latestAttempt.total} correctas
                </p>
              </div>
            )}
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm font-semibold text-slate-500">
                <span>
                  {progress.completed}/{progress.total} lecciones
                </span>
                <span>{progress.percent}%</span>
              </div>
              <ProgressBar percent={progress.percent} />
            </div>
          </aside>
        </div>
      </section>

      <ModuleSourceDocument courseModule={courseModule} />

      {resourceBundle ? <ModuleResourceLibrary bundle={resourceBundle} /> : null}

      <ModuleInfographic courseModule={courseModule} />

      <section className="rounded-2xl border border-line-soft bg-white p-6 shadow-card">
        <div className="mb-5 flex items-center gap-3">
          <Video className="text-ember" />
          <div>
            <h2 className="text-xl font-black">Videos recomendados en español</h2>
            <p className="text-sm text-slate-500">Material externo seleccionado para complementar el módulo.</p>
          </div>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {courseModule.videos.map((video) => (
            <VideoPlayer key={video.url} video={video} />
          ))}
        </div>
      </section>

      <ActiveLearningPanel courseModule={courseModule} />

      <section className="rounded-2xl border border-line-soft bg-white shadow-card">
        <div className="border-b border-line-soft p-6">
          <h2 className="text-xl font-black">Lecciones del módulo</h2>
          <p className="mt-1 text-sm text-slate-500">Teoría, práctica y evaluación ordenadas para estudiar sin perder continuidad.</p>
        </div>
        <div className="divide-y divide-line-soft">
          {courseModule.lessons.map((lesson) => {
            const completed = completedSlugs.has(lesson.slug);

            return (
              <Link
                key={lesson.slug}
                href={`/courses/${courseSeed.slug}/lessons/${lesson.slug}`}
                className="flex flex-col gap-4 p-5 transition hover:bg-blue-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-4">
                  <span className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${completed ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                    {completed ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-ember">{lesson.type}</p>
                    <h3 className="text-lg font-black">{lesson.title}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-slate-600">{lesson.summary}</p>
                  </div>
                </div>
                <ArrowRight className="text-ember" size={20} />
              </Link>
            );
          })}
        </div>
      </section>

      <ModuleExamCallout
        courseModule={courseModule}
        courseSlug={courseSeed.slug}
        latestAttempt={latestAttempt}
      />

      <ModuleNavigation
        courseSlug={courseSeed.slug}
        previous={adjacentModules.previous}
        next={adjacentModules.next}
      />
    </div>
  );
}

