import type { Metadata } from "next";

export type AiEngineeringModulePublication = {
  description: string;
  imageSrc: string;
};

export const AI_ENGINEERING_COURSE_DESCRIPTION =
  "Diseña, evalúa y lleva a producción sistemas inteligentes que combinan modelos, conocimiento, herramientas y supervisión humana.";

export const AI_ENGINEERING_COURSE_IMAGE =
  "/ai-engineering-course/cards/modulo-01-del-modelo-a-la-aplicacion.webp";

export const AI_ENGINEERING_PUBLIC_ORIGIN =
  "https://academia-ia-educativa.vercel.app";

export const aiEngineeringModulePublication: Record<
  string,
  AiEngineeringModulePublication
> = {
  "modulo-01": {
    description:
      "Distingue la capacidad de un modelo de la arquitectura completa que la convierte en producto.",
    imageSrc: AI_ENGINEERING_COURSE_IMAGE,
  },
  "modulo-02-modelos-fundacionales-seleccion": {
    description:
      "Selecciona modelos según la tarea, las restricciones y la evaluación documentada.",
    imageSrc:
      "/ai-engineering-course/cards/modulo-02-modelos-fundacionales-seleccion.webp",
  },
  "modulo-03-contexto-estado-memoria": {
    description:
      "Diseña contexto, estado y memoria para sostener interacciones y procesos confiables.",
    imageSrc:
      "/ai-engineering-course/cards/modulo-03-contexto-estado-memoria.webp",
  },
  "modulo-04-herramientas-apis-function-calling-mcp": {
    description:
      "Conecta herramientas y datos mediante APIs, function calling y MCP con control explícito.",
    imageSrc:
      "/ai-engineering-course/cards/modulo-04-herramientas-apis-function-calling-mcp.webp",
  },
  "modulo-05-rag-sistemas-conocimiento": {
    description:
      "Construye sistemas RAG que recuperan evidencia y responden con conocimiento verificable.",
    imageSrc:
      "/ai-engineering-course/cards/modulo-05-rag-sistemas-conocimiento.webp",
  },
  "modulo-06-workflows-automatizacion": {
    description:
      "Orquesta procesos definidos, resilientes e idempotentes con IA bajo control.",
    imageSrc:
      "/ai-engineering-course/cards/modulo-06-workflows-automatizacion.webp",
  },
  "modulo-07-agentes-sistemas-multiagente": {
    description:
      "Diseña agentes y equipos multiagente con roles, contratos y supervisión.",
    imageSrc:
      "/ai-engineering-course/cards/modulo-07-agentes-sistemas-multiagente.webp",
  },
  "modulo-08-evaluacion-observabilidad-trazabilidad": {
    description:
      "Evalúa calidad, observa comportamiento y traza decisiones de extremo a extremo.",
    imageSrc:
      "/ai-engineering-course/cards/modulo-08-evaluacion-observabilidad-trazabilidad.webp",
  },
  "modulo-09-seguridad-guardrails-supervision": {
    description:
      "Aplica guardrails, permisos y supervisión humana frente a amenazas reales.",
    imageSrc:
      "/ai-engineering-course/cards/modulo-09-seguridad-guardrails-supervision.webp",
  },
  "modulo-10-coste-velocidad-confiabilidad": {
    description:
      "Equilibra coste, latencia y confiabilidad con presupuestos operativos explícitos.",
    imageSrc:
      "/ai-engineering-course/cards/modulo-10-coste-velocidad-confiabilidad.webp",
  },
  "modulo-11-producto-automatizacion-empresarial": {
    description:
      "Convierte oportunidades empresariales en productos y automatizaciones medibles.",
    imageSrc:
      "/ai-engineering-course/cards/modulo-11-producto-automatizacion-empresarial.webp",
  },
  "modulo-12-produccion-proyecto-final": {
    description:
      "Prepara lanzamiento, operación y mejora continua del proyecto final.",
    imageSrc:
      "/ai-engineering-course/cards/modulo-12-produccion-proyecto-final.webp",
  },
};

type AiEngineeringMetadataInput = {
  title: string;
  description: string;
  canonicalPath: string;
  imageSrc: string;
  imageAlt: string;
};

export function createAiEngineeringMetadata({
  title,
  description,
  canonicalPath,
  imageSrc,
  imageAlt,
}: AiEngineeringMetadataInput): Metadata {
  const canonicalUrl = new URL(
    canonicalPath,
    AI_ENGINEERING_PUBLIC_ORIGIN,
  ).toString();
  const imageUrl = new URL(
    imageSrc,
    AI_ENGINEERING_PUBLIC_ORIGIN,
  ).toString();

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "es_AR",
      siteName: "Academia IA",
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          width: 1600,
          height: 900,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: imageUrl,
          alt: imageAlt,
        },
      ],
    },
  };
}
