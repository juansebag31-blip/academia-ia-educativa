import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Download, FileText, GraduationCap } from "lucide-react";
import { ModuleCard } from "@/components/module-card";
import { ModuleImageFrame } from "@/components/module-image-frame";
import { AiEngineeringCourseOverview } from "@/components/courses/ai-engineering/ai-engineering-course-overview";
import { LocalCourseProgress } from "@/components/learning/local-progress";
import { getCourseRouteParams, resolveCourse } from "@/lib/courses/catalog";

export function generateStaticParams() {
  return getCourseRouteParams();
}

export default async function CoursePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const courseDefinition = resolveCourse(courseSlug);

  if (!courseDefinition) {
    notFound();
  }

  if (courseDefinition.kind === "ai-engineering") {
    return <AiEngineeringCourseOverview course={courseDefinition} />;
  }

  const activeCourse = courseDefinition.course;
  const firstLessonSlug = activeCourse.modules[0].lessons[0].slug;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-72 text-white">
            <ModuleImageFrame image={activeCourse.modules[5].image} className="absolute inset-0 h-full rounded-none" />
            <div className="absolute inset-0 bg-slate-950/55" />
            <div className="relative p-6">
              <span className="rounded-full bg-black/40 px-3 py-1 text-sm font-bold">{activeCourse.category}</span>
            </div>
          </div>
          <div className="p-7 sm:p-10">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-ember">
              <GraduationCap size={18} />
              Curso principal
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{activeCourse.title}</h1>
            <p className="mt-4 text-slate-600">{activeCourse.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/courses/${activeCourse.slug}/lessons/${firstLessonSlug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-ember px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/20 hover:bg-ember-dark"
              >
                Continúa donde lo dejaste
                <ArrowRight size={18} />
              </Link>
              <a
                href="/course-assets/pdfs/Cuadernillo_Institucional_Programa_IA_Educativa_NotebookLM_COMPLETO.pdf"
                className="inline-flex items-center gap-2 rounded-xl border border-line-soft px-5 py-3 text-sm font-bold hover:bg-slate-50"
              >
                <Download size={18} />
                Cuadernillo completo
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line-soft bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Tu progreso</h2>
            <p className="mt-1 text-sm text-slate-500">Continúa el recorrido desde la última lección abierta.</p>
          </div>
          <p className="text-sm font-bold text-slate-500">Guardado en este navegador</p>
        </div>
        <div className="mt-5">
          <LocalCourseProgress showCount />
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center gap-3">
          <FileText className="text-ember" />
          <div>
            <h2 className="text-2xl font-black">Secciones y módulos</h2>
            <p className="text-sm text-slate-500">Haz clic en un módulo para ver sus lecciones, actividad y evaluación.</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {activeCourse.modules.map((courseModule) => (
            <ModuleCard key={courseModule.slug} courseModule={courseModule} />
          ))}
        </div>
      </section>
    </div>
  );
}

