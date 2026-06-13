import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock, FileText, Sparkles } from "lucide-react";
import { ModuleCard } from "@/components/module-card";
import { LocalCourseProgress } from "@/components/learning/local-progress";
import { courseSeed } from "@/lib/course-seed";

const moduleHighlights = [
  "Comprender la evolución histórica de la IA y su impacto educativo.",
  "Entender cómo la IA generativa produce respuestas y por qué hay que verificarlas.",
  "Reconocer la infraestructura de datos, internet y cómputo detrás de la IA.",
  "Aplicar criterios éticos, privacidad y pensamiento crítico al usar IA.",
  "Elegir herramientas de IA según tarea, riesgo y evidencia necesaria.",
  "Crear notebooks con fuentes propias, preguntas y trazabilidad.",
  "Estudiar mejor con guías, preguntas y respuestas verificables.",
  "Diseñar clases, materiales y evaluaciones con apoyo de NotebookLM.",
  "Investigar con fuentes, síntesis académica y criterio metodológico.",
  "Construir un proyecto final aplicado, defendible y documentado.",
  "Mantener una rutina profesional de actualización en IA.",
];

const featuredHeroQuote = {
  eyebrow: "Manifiesto IA",
  quote: "Estudiar IA hoy es prepararse para la nueva revolución tecnológica.",
  support:
    "Aprender a preguntar, verificar fuentes y producir evidencia propia es el nuevo diferencial profesional.",
  principles: ["Criterio", "Fuentes", "Creatividad"],
};

export default function DashboardPage() {
  const firstLessonSlug = courseSeed.modules[0].lessons[0].slug;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[680px] overflow-hidden rounded-2xl border border-slate-900 bg-ink text-white shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={courseSeed.modules[0].image.src} alt={courseSeed.modules[0].image.alt} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071A2B] via-[#071A2B]/80 to-[#071A2B]/28" />
          <div className="absolute inset-0 course-hero-grid opacity-70" />

          <div className="relative flex min-h-[680px] flex-col justify-between p-7 sm:p-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold backdrop-blur">
                <Sparkles size={16} />
                Programa gratuito de aprendizaje
              </span>
              <h1 className="mt-6 text-3xl font-black leading-tight sm:text-4xl">{courseSeed.title}</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-100">{courseSeed.description}</p>
            </div>

            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-3xl border border-white/18 bg-white/12 p-5 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-6">
                <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full border border-cyan-200/35" />
                <div className="absolute bottom-4 right-6 h-16 w-16 rounded-2xl border border-white/20 bg-white/8" />
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">{featuredHeroQuote.eyebrow}</p>
                <p className="mt-4 max-w-3xl text-2xl font-black leading-tight text-white sm:text-3xl">
                  {featuredHeroQuote.quote}
                </p>
                <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-slate-100">
                  {featuredHeroQuote.support}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {featuredHeroQuote.principles.map((principle) => (
                    <span key={principle} className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs font-black text-white">
                      {principle}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <BookOpen className="text-cyan-200" size={20} />
                  <p className="mt-2 text-sm font-black">11 módulos</p>
                  <p className="mt-1 text-xs text-slate-200">Ruta completa por temas.</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <FileText className="text-violet-200" size={20} />
                  <p className="mt-2 text-sm font-black">PDFs y lecciones</p>
                  <p className="mt-1 text-xs text-slate-200">Material fuente organizado.</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <CheckCircle2 className="text-cyan-200" size={20} />
                  <p className="mt-2 text-sm font-black">Examen 80%</p>
                  <p className="mt-1 text-xs text-slate-200">Validación por módulo.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/courses/${courseSeed.slug}/lessons/${firstLessonSlug}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-ember px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/20 transition hover:bg-ember-dark"
                >
                  Continúa donde lo dejaste
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/program"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  Ver programa
                </Link>
              </div>
            </div>
            <span className="absolute bottom-5 right-5 rounded-full bg-black/55 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
              {courseSeed.modules[0].image.credit}
            </span>
          </div>
        </div>

        <aside className="rounded-2xl border border-line-soft bg-white p-6 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">Tu progreso</h2>
              <p className="mt-1 text-sm text-slate-500">Avance local guardado en esta máquina.</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-4 text-ember">
              <BookOpen size={30} />
            </div>
          </div>

          <div className="mt-6"><LocalCourseProgress showCount /></div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <Clock className="text-ember" size={20} />
              <p className="mt-2 text-sm font-bold">22 horas sugeridas</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <Sparkles className="text-ember" size={20} />
              <p className="mt-2 text-sm font-bold">{courseSeed.modules.length} módulos</p>
            </div>
          </div>

          <div className="mt-6 border-t border-line-soft pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-ink">Qué aprenderás</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">Resumen rápido por módulo</p>
              </div>
              <Link href="/modules" className="text-xs font-black text-ember">
                Ver módulos
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {courseSeed.modules.map((courseModule, index) => {
                return (
                  <Link
                    key={courseModule.slug}
                    href={`/courses/${courseSeed.slug}/modules/${courseModule.slug}`}
                    className="group flex min-h-28 flex-col justify-between rounded-xl border border-line-soft bg-slate-50 p-3 transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-lg bg-white px-2 py-1 text-[11px] font-black text-ember shadow-sm">Módulo {courseModule.order}</span>
                      <ArrowRight className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-ember" size={16} />
                    </div>
                    <p className="mt-3 text-sm font-bold leading-5 text-ink">{moduleHighlights[index]}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Módulos del curso</h2>
            <p className="mt-1 text-sm text-slate-500">Contenido estructurado a partir de tus PDFs profesionales.</p>
          </div>
          <Link href="/visual" className="hidden text-sm font-bold text-ember sm:inline-flex">
            Vista visual completa
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courseSeed.modules.map((courseModule) => (
            <ModuleCard key={courseModule.slug} courseModule={courseModule} />
          ))}
        </div>
      </section>
    </div>
  );
}
