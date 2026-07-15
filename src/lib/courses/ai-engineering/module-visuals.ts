export const aiEngineeringVisualComponentTypes = [
  "model-vs-system",
  "workflow-vs-agent",
  "system-components-map",
  "minimum-complexity-ladder",
  "imaging-study-flow",
] as const;

export type AiEngineeringVisualComponentType =
  (typeof aiEngineeringVisualComponentTypes)[number];

export type AiEngineeringVisualPlacement = {
  afterSection: string;
  visualId: string;
  title: string;
  description: string;
  componentType: AiEngineeringVisualComponentType;
};

export type AiEngineeringKeyIdea = {
  afterSection: string;
  ideaId: string;
  text: string;
};

export const aiEngineeringModuleVisuals: Record<string, AiEngineeringVisualPlacement[]> = {
  "modulo-01": [
    {
      afterSection: "aplicacion",
      visualId: "modelo-frente-sistema",
      title: "Modelo frente a sistema inteligente",
      description: "Compara una capacidad de IA con el producto completo que la vuelve utilizable y controlable.",
      componentType: "model-vs-system",
    },
    {
      afterSection: "agente",
      visualId: "workflow-frente-agente",
      title: "Workflow frente a agente",
      description: "Distingue una secuencia definida de un ciclo que decide su siguiente acción.",
      componentType: "workflow-vs-agent",
    },
    {
      afterSection: "componentes",
      visualId: "mapa-componentes-sistema",
      title: "Mapa de componentes del sistema",
      description: "Ordena las piezas técnicas y humanas que rodean al modelo en un sistema inteligente.",
      componentType: "system-components-map",
    },
    {
      afterSection: "complejidad",
      visualId: "escalera-minima-complejidad",
      title: "Escalera de mínima complejidad suficiente",
      description: "Muestra cómo aumentar la arquitectura solo cuando el nivel anterior deja de ser suficiente.",
      componentType: "minimum-complexity-ladder",
    },
    {
      afterSection: "caso",
      visualId: "flujo-estudios-imagenes",
      title: "Flujo del caso de estudios por imágenes",
      description: "Resume el recorrido desde el pedido hasta la confirmación humana.",
      componentType: "imaging-study-flow",
    },
  ],
};

export const aiEngineeringModuleKeyIdeas: Record<string, AiEngineeringKeyIdea[]> = {
  "modulo-01": [
    {
      afterSection: "aplicacion",
      ideaId: "idea-modelo-sistema",
      text: "El modelo produce una salida. El sistema completo controla cómo, cuándo, con qué datos y bajo qué reglas se utiliza esa capacidad.",
    },
    {
      afterSection: "agente",
      ideaId: "idea-workflow-agente",
      text: "Un workflow sigue una secuencia definida. Un agente observa, decide, actúa y evalúa; no es automáticamente la mejor opción.",
    },
    {
      afterSection: "complejidad",
      ideaId: "idea-minima-complejidad",
      text: "Solo se asciende al siguiente nivel cuando el anterior resulta insuficiente para resolver el problema.",
    },
  ],
};

export function getAiEngineeringModuleVisuals(moduleSlug: string) {
  return aiEngineeringModuleVisuals[moduleSlug] ?? [];
}

export function getAiEngineeringModuleKeyIdeas(moduleSlug: string) {
  return aiEngineeringModuleKeyIdeas[moduleSlug] ?? [];
}
