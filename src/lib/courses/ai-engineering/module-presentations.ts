export type AiEngineeringPresentationSlide = {
  id: string;
  sourcePath: string;
  publicPath: string;
  alt: string;
  width: number;
  height: number;
};

export type AiEngineeringPresentationConfig = {
  title: string;
  slides: AiEngineeringPresentationSlide[];
};

const moduleOneSlideCount = 17;

export const aiEngineeringModulePresentations: Record<
  string,
  AiEngineeringPresentationConfig
> = {
  "modulo-01": {
    title: "Módulo 1 · De un modelo a un sistema inteligente",
    slides: Array.from({ length: moduleOneSlideCount }, (_, index) => {
      const number = String(index + 1).padStart(2, "0");
      return {
        id: `slide-${number}`,
        sourcePath: `assets/presentations/modulo-01-slides/slide-${number}.webp`,
        publicPath: `/ai-engineering-assets/modulo-01/slides/slide-${number}.webp`,
        alt: `Diapositiva ${index + 1} de ${moduleOneSlideCount} de la presentación del Módulo 1`,
        width: 1600,
        height: 900,
      };
    }),
  },
};

export function getAiEngineeringModulePresentation(moduleSlug: string) {
  return aiEngineeringModulePresentations[moduleSlug];
}
