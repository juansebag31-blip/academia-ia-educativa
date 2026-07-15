const learningPathLabels: Record<string, string> = {
  orientacion: "Orientación",
  contenido_fundacional: "Contenido fundacional",
  infografia: "Infografía",
  audio_explicativo: "Audio explicativo",
  casos_reales: "Casos reales",
  presentacion: "Presentación",
  actividad: "Actividad",
  autoevaluacion: "Autoevaluación",
};

export function formatLearningPathLabel(sourceKey: string) {
  return learningPathLabels[sourceKey] ?? sourceKey.replaceAll("_", " ");
}
