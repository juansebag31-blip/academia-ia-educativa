"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type {
  AiEngineeringCourseDefinition,
  AiEngineeringModule,
} from "@/lib/courses/types";
import { useAiEngineeringCourseProgressSnapshot } from "./ai-engineering-progress";

type ModuleCardEditorial = {
  description: string;
  imageSrc?: string;
  visualId?: string;
  slideNumber?: number;
  alt: string;
};

const moduleCardEditorial: Record<string, ModuleCardEditorial> = {
  "modulo-01": {
    description: "Distingue la capacidad de un modelo de la arquitectura completa que la convierte en producto.",
    imageSrc: "/ai-engineering-course/cards/modulo-01-del-modelo-a-la-aplicacion.webp",
    alt: "Un modelo de inteligencia artificial evoluciona hacia un sistema completo con memoria, herramientas, orquestación, evaluación, seguridad y una aplicación para el usuario.",
  },
  "modulo-02-modelos-fundacionales-seleccion": {
    description: "Selecciona modelos según la tarea, las restricciones y la evaluación documentada.",
    imageSrc: "/ai-engineering-course/cards/modulo-02-modelos-fundacionales-seleccion.webp",
    alt: "Comparación documentada de modelos de IA según capacidad, coste, velocidad, seguridad y adecuación a la tarea.",
  },
  "modulo-03-contexto-estado-memoria": {
    description: "Diseña contexto, estado y memoria para sostener interacciones y procesos confiables.",
    imageSrc: "/ai-engineering-course/cards/modulo-03-contexto-estado-memoria.webp",
    alt: "Sistema de IA que conserva contexto, estado y memoria para sostener conversaciones y procesos coherentes.",
  },
  "modulo-04-herramientas-apis-function-calling-mcp": {
    description: "Conecta herramientas y datos mediante APIs, function calling y MCP con control explícito.",
    imageSrc: "/ai-engineering-course/cards/modulo-04-herramientas-apis-function-calling-mcp.webp",
    alt: "Modelo de IA conectado mediante function calling y MCP con APIs, bases de datos, servicios y herramientas externas.",
  },
  "modulo-05-rag-sistemas-conocimiento": {
    description: "Construye sistemas RAG que recuperan evidencia y responden con conocimiento verificable.",
    imageSrc: "/ai-engineering-course/cards/modulo-05-rag-sistemas-conocimiento.webp",
    alt: "Flujo RAG que ingiere documentos, crea representaciones vectoriales, recupera evidencia y genera respuestas fundamentadas.",
  },
  "modulo-06-workflows-automatizacion": {
    description: "Orquesta procesos definidos, resilientes e idempotentes con IA bajo control.",
    imageSrc: "/ai-engineering-course/cards/modulo-06-workflows-automatizacion.webp",
    alt: "Workflow automatizado que conecta disparadores, decisiones, herramientas, acciones, excepciones y resultados verificables.",
  },
  "modulo-07-agentes-sistemas-multiagente": {
    description: "Diseña agentes y equipos multiagente con roles, contratos y supervisión.",
    imageSrc: "/ai-engineering-course/cards/modulo-07-agentes-sistemas-multiagente.webp",
    alt: "Red de agentes de IA especializados que colaboran con memoria compartida y coordinación para resolver una tarea común.",
  },
  "modulo-08-evaluacion-observabilidad-trazabilidad": {
    description: "Evalúa calidad, observa comportamiento y traza decisiones de extremo a extremo.",
    imageSrc: "/ai-engineering-course/cards/modulo-08-evaluacion-observabilidad-trazabilidad.webp",
    alt: "Panel de evaluación y monitoreo de un sistema de IA con métricas, trazas, revisión y validación de resultados.",
  },
  "modulo-09-seguridad-guardrails-supervision": {
    description: "Aplica guardrails, permisos y supervisión humana frente a amenazas reales.",
    imageSrc: "/ai-engineering-course/cards/modulo-09-seguridad-guardrails-supervision.webp",
    alt: "Sistema de IA protegido por guardrails, filtros, políticas, alertas, trazabilidad y supervisión humana.",
  },
  "modulo-10-coste-velocidad-confiabilidad": {
    description: "Equilibra coste, latencia y confiabilidad con presupuestos operativos explícitos.",
    imageSrc: "/ai-engineering-course/cards/modulo-10-coste-velocidad-confiabilidad.webp",
    alt: "Sistema de IA que equilibra coste, velocidad y confiabilidad mediante optimización, rendimiento y validación segura.",
  },
  "modulo-11-producto-automatizacion-empresarial": {
    description: "Convierte oportunidades empresariales en productos y automatizaciones medibles.",
    imageSrc: "/ai-engineering-course/cards/modulo-11-producto-automatizacion-empresarial.webp",
    alt: "Flujo de producto de IA que transforma personas, procesos y datos en resultados empresariales medibles.",
  },
  "modulo-12-produccion-proyecto-final": {
    description: "Prepara lanzamiento, operación y mejora continua del proyecto final.",
    imageSrc: "/ai-engineering-course/cards/modulo-12-produccion-proyecto-final.webp",
    alt: "Paso de un sistema de IA desde el desarrollo hasta un despliegue en producción seguro, monitoreado y listo para operar.",
  },
};

export function AiEngineeringCourseCatalog({
  course,
}: {
  course: AiEngineeringCourseDefinition;
}) {
  const { snapshot } = useAiEngineeringCourseProgressSnapshot(course);

  return (
    <ol className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {course.curriculum.map((modulePlan) => {
        const courseModule = modulePlan.publicSlug
          ? course.modules.find((candidate) => candidate.summary.slug === modulePlan.publicSlug)
          : undefined;
        if (!courseModule || modulePlan.editorialStatus !== "approved" || !modulePlan.publish) return null;

        const progress = snapshot.modules.find(
          (candidate) => candidate.moduleSlug === courseModule.summary.slug,
        ) ?? {
          completedUnits: 0,
          totalUnits: courseModule.configuration.progressUnits.length,
          percentage: 0,
        };
        const editorial = moduleCardEditorial[courseModule.summary.slug];
        const imageSrc = resolveCardImage(courseModule, editorial);
        const href = `/courses/${course.summary.slug}/modules/${courseModule.summary.slug}`;
        const action = progress.percentage === 100
          ? "Revisar módulo"
          : progress.percentage > 0
            ? "Continuar módulo"
            : "Comenzar módulo";
        const titleId = `module-card-${courseModule.summary.order}-title`;
        const descriptionId = `module-card-${courseModule.summary.order}-description`;
        const progressId = `module-card-${courseModule.summary.order}-progress`;

        return (
          <li key={modulePlan.editorialSlug}>
            <article
              aria-labelledby={titleId}
              aria-describedby={`${descriptionId} ${progressId}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#0f766e]/20 bg-[#f8fbfa] shadow-[0_14px_40px_rgba(11,31,51,0.08)] transition hover:-translate-y-0.5 hover:border-[#0f766e]/45 hover:shadow-[0_20px_52px_rgba(11,31,51,0.13)] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div className="relative aspect-video overflow-hidden border-b border-[#0f766e]/15 bg-[#071a2b]">
                <Image
                  src={imageSrc}
                  alt={editorial.alt}
                  fill
                  sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                  className="object-contain"
                />
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-[15px] font-black uppercase tracking-[0.14em] text-[#0f766e]">
                  Módulo {courseModule.summary.order}
                </p>

                <h3
                  id={titleId}
                  className="mt-3 text-xl font-black leading-7 text-[#0b1f33] xl:min-h-14"
                >
                  {courseModule.summary.title}
                </h3>
                <p
                  id={descriptionId}
                  className="mt-2 flex-1 text-sm leading-6 text-slate-600"
                >
                  {editorial.description}
                </p>

                <div id={progressId} className="mt-5 border-t border-slate-200 pt-4" aria-live="polite">
                  <div className="flex items-center justify-between gap-3 text-sm font-black">
                    <span className="text-slate-700">
                      {progress.completedUnits} de {progress.totalUnits} unidades
                    </span>
                    <span className="font-mono text-[#0f766e]">{progress.percentage} %</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`Progreso del Módulo ${courseModule.summary.order}: ${courseModule.summary.title}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress.percentage}
                    className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
                  >
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e,#2dd4bf)] transition-[width] duration-300 motion-reduce:transition-none"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={href}
                  aria-label={`${action}: Módulo ${courseModule.summary.order}, ${courseModule.summary.title}`}
                  className="focus-ring mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-[#0b625c]"
                >
                  {action}
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}

function resolveCardImage(
  courseModule: AiEngineeringModule,
  editorial: ModuleCardEditorial,
) {
  if (editorial.imageSrc) return editorial.imageSrc;

  if (editorial.slideNumber) {
    const slide = courseModule.presentation.slides[editorial.slideNumber - 1];
    if (slide) return slide.publicPath;
  }

  if (editorial.visualId) {
    const visual = courseModule.visuals.find(
      (candidate) => candidate.visualId === editorial.visualId,
    );
    if (visual && "publicPath" in visual && visual.publicPath) return visual.publicPath;
  }

  return courseModule.assets.infographic.publicPath;
}
