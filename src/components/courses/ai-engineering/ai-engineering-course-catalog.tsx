"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type {
  AiEngineeringCourseDefinition,
  AiEngineeringModule,
} from "@/lib/courses/types";
import { useAiEngineeringCourseProgressSnapshot } from "./ai-engineering-progress";

type ModuleCardEditorial = {
  description: string;
  visualId?: string;
  slideNumber?: number;
  alt: string;
};

const moduleCardEditorial: Record<string, ModuleCardEditorial> = {
  "modulo-01": {
    description: "Distingue la capacidad de un modelo de la arquitectura completa que la convierte en producto.",
    slideNumber: 3,
    alt: "Evolución por niveles desde un modelo aislado hasta un sistema inteligente productivo.",
  },
  "modulo-02-modelos-fundacionales-seleccion": {
    description: "Selecciona modelos según la tarea, las restricciones y la evaluación documentada.",
    visualId: "proceso-seleccion",
    alt: "Proceso de selección de modelos desde el problema real hasta una decisión documentada.",
  },
  "modulo-03-contexto-estado-memoria": {
    description: "Diseña contexto, estado y memoria para sostener interacciones y procesos confiables.",
    visualId: "flujo-contexto-memoria",
    alt: "Flujo de memoria persistente, recuperación selectiva, inferencia y actualización de estado.",
  },
  "modulo-04-herramientas-apis-function-calling-mcp": {
    description: "Conecta herramientas y datos mediante APIs, function calling y MCP con control explícito.",
    visualId: "arquitectura-mcp",
    alt: "Arquitectura MCP con host, cliente y servidor conectados mediante JSON-RPC.",
  },
  "modulo-05-rag-sistemas-conocimiento": {
    description: "Construye sistemas RAG que recuperan evidencia y responden con conocimiento verificable.",
    visualId: "arquitectura-rag",
    alt: "Arquitectura RAG de extremo a extremo con ingestión, recuperación, contexto y respuesta con citas.",
  },
  "modulo-06-workflows-automatizacion": {
    description: "Orquesta procesos definidos, resilientes e idempotentes con IA bajo control.",
    visualId: "arquitectura-workflow",
    alt: "Arquitectura de workflow separada en planos de control y ejecución.",
  },
  "modulo-07-agentes-sistemas-multiagente": {
    description: "Diseña agentes y equipos multiagente con roles, contratos y supervisión.",
    visualId: "workflow-agente-multiagente",
    alt: "Comparación entre workflow determinista, agente y sistema multiagente.",
  },
  "modulo-08-evaluacion-observabilidad-trazabilidad": {
    description: "Evalúa calidad, observa comportamiento y traza decisiones de extremo a extremo.",
    visualId: "evaluacion-observabilidad-trazabilidad",
    alt: "Relación entre evaluación, observabilidad y trazabilidad mediante identificadores compartidos.",
  },
  "modulo-09-seguridad-guardrails-supervision": {
    description: "Aplica guardrails, permisos y supervisión humana frente a amenazas reales.",
    visualId: "guardrails-capas",
    alt: "Arquitectura de guardrails por capas desde la validación de entrada hasta los límites de ejecución.",
  },
  "modulo-10-coste-velocidad-confiabilidad": {
    description: "Equilibra coste, latencia y confiabilidad con presupuestos operativos explícitos.",
    visualId: "presupuesto-latencia",
    alt: "Presupuesto de latencia distribuido entre cola, generación, herramientas, reintentos y serialización.",
  },
  "modulo-11-producto-automatizacion-empresarial": {
    description: "Convierte oportunidades empresariales en productos y automatizaciones medibles.",
    visualId: "workflow-empresarial",
    alt: "Workflow empresarial desde el evento y el contexto hasta la verificación y el cierre.",
  },
  "modulo-12-produccion-proyecto-final": {
    description: "Prepara lanzamiento, operación y mejora continua del proyecto final.",
    visualId: "release-deploy-rollout",
    alt: "Proceso de producción con release, deploy y rollout progresivo.",
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
                <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-[#071a2b]/90 px-3 py-1.5 font-mono text-xs font-black text-[#99f6e4] shadow-lg backdrop-blur">
                  Módulo {String(courseModule.summary.order).padStart(2, "0")}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">
                    Módulo {courseModule.summary.order}
                  </p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-800">
                    <CheckCircle2 size={14} aria-hidden="true" />
                    Disponible
                  </span>
                </div>

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
