import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Award, Download, FileText, Video } from "lucide-react";
import { LessonCompletionButton } from "@/components/learning/lesson-completion-button";
import { LocalModuleProgress } from "@/components/learning/local-progress";
import { ModuleImageFrame } from "@/components/module-image-frame";
import { VideoPlayer } from "@/components/video-player";
import { courseSeed } from "@/lib/course-seed";
import { findAdjacentLessons, findLessonBySlug } from "@/lib/course";

export default async function LessonPage({ params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const { courseSlug, lessonSlug } = await params;

  if (courseSlug !== courseSeed.slug) {
    notFound();
  }

  const found = findLessonBySlug(courseSeed, lessonSlug);
  if (!found) {
    notFound();
  }

  const { module: courseModule, lesson } = found;
  const adjacent = findAdjacentLessons(courseSeed, lesson.slug);

  return (
    <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
      <article className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card">
        <ModuleImageFrame image={courseModule.image} className="h-56" />
        <div className="border-b border-line-soft p-6 sm:p-8">
          <Link href={`/courses/${courseSeed.slug}/modules/${courseModule.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-ember">
            <ArrowLeft size={17} />
            Volver al módulo
          </Link>
          <p className="mt-6 text-xs font-bold uppercase tracking-wide text-ember">{courseModule.title}</p>
          <h1 className="mt-3 text-3xl font-black leading-tight">{lesson.title}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">{lesson.summary}</p>
        </div>

        <div className="prose prose-slate max-w-none p-6 prose-headings:text-ink sm:p-8">
          {lesson.content.split("\n\n").map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          <h2>Checklist de estudio</h2>
          <ul>
            {lesson.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2>Material de apoyo</h2>
          <p>El PDF original queda disponible como fuente primaria del módulo. Úsalo para ampliar la lectura y verificar el contenido estructurado.</p>
          <p>
            <a href={`/course-assets/pdfs/${encodeURIComponent(courseModule.pdfFile)}`} className="inline-flex items-center gap-2 no-underline">
              <Download size={18} />
              Descargar PDF del módulo
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-line-soft p-6 sm:flex-row sm:items-center sm:justify-between">
          <LessonCompletionButton lessonSlug={lesson.slug} />
          <div className="flex gap-3">
            {adjacent.previous && (
              <Link href={`/courses/${courseSeed.slug}/lessons/${adjacent.previous.slug}`} className="inline-flex items-center gap-2 rounded-xl border border-line-soft px-4 py-3 text-sm font-bold hover:bg-slate-50">
                <ArrowLeft size={17} />
                Anterior
              </Link>
            )}
            {adjacent.next && (
              <Link href={`/courses/${courseSeed.slug}/lessons/${adjacent.next.slug}`} className="inline-flex items-center gap-2 rounded-xl border border-line-soft px-4 py-3 text-sm font-bold hover:bg-slate-50">
                Siguiente
                <ArrowRight size={17} />
              </Link>
            )}
          </div>
        </div>
      </article>

      <aside className="space-y-5">
        <section className="rounded-2xl border border-line-soft bg-white p-5 shadow-card">
          <h2 className="text-lg font-black">Progreso del módulo</h2>
          <div className="mt-4"><LocalModuleProgress courseModule={courseModule} /></div>
        </section>

        <Link
          href={`/courses/${courseSeed.slug}/modules/${courseModule.slug}/exam`}
          className="flex items-center justify-between rounded-2xl border border-line-soft bg-white p-5 shadow-card transition hover:bg-blue-50"
        >
          <span className="flex items-center gap-3 font-black">
            <Award className="text-ember" size={22} />
            Examen del módulo
          </span>
          <ArrowRight className="text-ember" size={18} />
        </Link>

        <section className="rounded-2xl border border-line-soft bg-white shadow-card">
          <div className="border-b border-line-soft p-5">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Video className="text-ember" size={20} />
              Videos
            </h2>
          </div>
          <div className="divide-y divide-line-soft">
            {courseModule.videos.map((video) => (
              <div key={video.url} className="p-4">
                <VideoPlayer video={video} compact />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line-soft bg-white shadow-card">
          <div className="border-b border-line-soft p-5">
            <h2 className="text-lg font-black">Lecciones</h2>
          </div>
          <div className="max-h-[560px] divide-y divide-line-soft overflow-auto">
            {courseModule.lessons.map((item) => (
              <Link
                key={item.slug}
                href={`/courses/${courseSeed.slug}/lessons/${item.slug}`}
                className={`flex gap-3 p-4 text-sm transition hover:bg-blue-50 ${item.slug === lesson.slug ? "bg-blue-50" : ""}`}
              >
                <span className="mt-0.5 text-ember">
                  <FileText size={17} />
                </span>
                <span className="font-bold">{item.title}</span>
              </Link>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

