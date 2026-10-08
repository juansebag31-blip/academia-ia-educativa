import type { RagSourceKind } from "./corpus";

export type RagEvaluationKind =
  | "same_words"
  | "paraphrase"
  | "relational"
  | "ambiguous"
  | "unanswerable";

export type RagEvaluationTarget = {
  moduleSlug: string | null;
  sourceKind?: RagSourceKind;
  sectionNeedles?: string[];
};

export type RagEvaluationCase = {
  id: string;
  kind: RagEvaluationKind;
  question: string;
  answerable: boolean;
  expectedLabel: string;
  expectedTargets: RagEvaluationTarget[];
};

export const RAG_RETRIEVAL_EVALUATION_CASES: RagEvaluationCase[] = [
  {
    id: "m01-fluidez-verdad",
    kind: "same_words",
    question: "¿Por qué la fluidez de un modelo de lenguaje no equivale a verdad?",
    answerable: true,
    expectedLabel: "Módulo 1 · Modelos de lenguaje: fluidez no equivale a verdad",
    expectedTargets: [{
      moduleSlug: "modulo-1-introduccion-historica-ia",
      sectionNeedles: ["fluidez no equivale a verdad"],
    }],
  },
  {
    id: "m01-auge-reciente",
    kind: "paraphrase",
    question: "¿Qué condiciones tecnológicas hicieron posible el auge reciente de la inteligencia artificial?",
    answerable: true,
    expectedLabel: "Módulo 1 · Internet, datos, nube y capacidad de cálculo",
    expectedTargets: [{
      moduleSlug: "modulo-1-introduccion-historica-ia",
      sectionNeedles: ["por que ahora", "internet datos nube"],
    }],
  },
  {
    id: "m02-alucinaciones",
    kind: "same_words",
    question: "¿Por qué aparecen errores o alucinaciones en la IA generativa?",
    answerable: true,
    expectedLabel: "Módulo 2 · Errores o alucinaciones",
    expectedTargets: [{
      moduleSlug: "modulo-2-ia-generativa-lenguaje-simple",
      sectionNeedles: ["errores o alucinaciones"],
    }],
  },
  {
    id: "m02-pregunta-respuesta",
    kind: "paraphrase",
    question: "¿Qué pasos simplificados sigue una IA desde que recibe una consulta hasta que redacta una respuesta?",
    answerable: true,
    expectedLabel: "Módulo 2 · De una pregunta a una respuesta",
    expectedTargets: [{
      moduleSlug: "modulo-2-ia-generativa-lenguaje-simple",
      sectionNeedles: ["de una pregunta a una respuesta", "cadena simplificada"],
    }],
  },
  {
    id: "m03-infraestructura",
    kind: "same_words",
    question: "¿Qué papel cumplen internet, los datos y la computación en la infraestructura de la IA?",
    answerable: true,
    expectedLabel: "Módulo 3 · Infraestructura de internet, datos y computación",
    expectedTargets: [{ moduleSlug: "modulo-3-infraestructura-datos-computacion" }],
  },
  {
    id: "m03-procesamiento",
    kind: "paraphrase",
    question: "¿Dónde ocurre realmente el procesamiento de una herramienta de IA y qué función tienen servidores y chips?",
    answerable: true,
    expectedLabel: "Módulo 3 · Computación: servidores, chips y procesamiento",
    expectedTargets: [{
      moduleSlug: "modulo-3-infraestructura-datos-computacion",
      sectionNeedles: ["computacion servidores chips y procesamiento"],
    }],
  },
  {
    id: "m04-semaforo",
    kind: "same_words",
    question: "¿Cómo funciona el semáforo pedagógico para decidir cuándo usar inteligencia artificial?",
    answerable: true,
    expectedLabel: "Módulo 4 · Semáforo pedagógico",
    expectedTargets: [{
      moduleSlug: "modulo-4-uso-responsable-etico-critico",
      sectionNeedles: ["semaforo pedagogico"],
    }],
  },
  {
    id: "m04-privacidad",
    kind: "paraphrase",
    question: "¿Qué debería revisar antes de subir datos o documentos sensibles a una herramienta de IA?",
    answerable: true,
    expectedLabel: "Módulo 4 · Privacidad antes de cargar información",
    expectedTargets: [{
      moduleSlug: "modulo-4-uso-responsable-etico-critico",
      sectionNeedles: ["privacidad", "antes de cargar informacion"],
    }],
  },
  {
    id: "m05-familias-herramientas",
    kind: "same_words",
    question: "¿Cuáles son las principales familias de herramientas de IA para educación?",
    answerable: true,
    expectedLabel: "Módulo 5 · Familias de herramientas",
    expectedTargets: [{
      moduleSlug: "modulo-5-herramientas-ia-educacion",
      sectionNeedles: ["familias de herramientas"],
    }],
  },
  {
    id: "m05-elegir-herramienta",
    kind: "paraphrase",
    question: "¿Cómo elijo entre NotebookLM, un chatbot conversacional y un buscador con IA para una tarea educativa?",
    answerable: true,
    expectedLabel: "Módulo 5 · Elegir herramientas con criterio",
    expectedTargets: [{ moduleSlug: "modulo-5-herramientas-ia-educacion" }],
  },
  {
    id: "m06-fuentes-corazon",
    kind: "same_words",
    question: "¿Por qué las fuentes son el corazón de NotebookLM?",
    answerable: true,
    expectedLabel: "Módulo 6 · Fuentes: el corazón de NotebookLM",
    expectedTargets: [{
      moduleSlug: "modulo-6-notebooklm-desde-cero",
      sectionNeedles: ["fuentes el corazon de notebooklm"],
    }],
  },
  {
    id: "m06-buenas-preguntas",
    kind: "paraphrase",
    question: "¿Qué características debería tener una consigna útil para conversar con mis materiales en NotebookLM?",
    answerable: true,
    expectedLabel: "Módulo 6 · Cómo formular buenas preguntas",
    expectedTargets: [{
      moduleSlug: "modulo-6-notebooklm-desde-cero",
      sectionNeedles: ["formular buenas preguntas", "consignas utiles"],
    }],
  },
  {
    id: "m07-examenes",
    kind: "same_words",
    question: "¿Cómo se pueden preparar exámenes con NotebookLM?",
    answerable: true,
    expectedLabel: "Módulo 7 · Preparación de exámenes",
    expectedTargets: [{
      moduleSlug: "modulo-7-notebooklm-para-estudiantes",
      sectionNeedles: ["preparacion de examenes"],
    }],
  },
  {
    id: "m07-sistema-estudio",
    kind: "paraphrase",
    question: "¿Cómo puedo transformar apuntes dispersos en un sistema de estudio confiable y activo?",
    answerable: true,
    expectedLabel: "Módulo 7 · Construir un sistema de estudio",
    expectedTargets: [{
      moduleSlug: "modulo-7-notebooklm-para-estudiantes",
      sectionNeedles: ["construir un sistema de estudio", "organizacion de fuentes"],
    }],
  },
  {
    id: "m08-secuencia-didactica",
    kind: "same_words",
    question: "¿Cómo puede un docente diseñar secuencias didácticas con NotebookLM?",
    answerable: true,
    expectedLabel: "Módulo 8 · Diseño de secuencias didácticas",
    expectedTargets: [{
      moduleSlug: "modulo-8-notebooklm-para-docentes",
      sectionNeedles: ["diseno de secuencias didacticas"],
    }],
  },
  {
    id: "m08-inclusion",
    kind: "paraphrase",
    question: "¿Cómo adaptar materiales para distintos niveles y necesidades sin perder rigor académico?",
    answerable: true,
    expectedLabel: "Módulo 8 · Adaptación de contenidos e inclusión",
    expectedTargets: [{
      moduleSlug: "modulo-8-notebooklm-para-docentes",
      sectionNeedles: ["adaptacion de contenidos e inclusion"],
    }],
  },
  {
    id: "m09-matriz-autores",
    kind: "same_words",
    question: "¿Cómo se construye una matriz de autores y conceptos para una investigación?",
    answerable: true,
    expectedLabel: "Módulo 9 · Matriz de autores y conceptos",
    expectedTargets: [{
      moduleSlug: "modulo-9-investigacion-academica-asistida",
      sectionNeedles: ["matriz de autores y conceptos", "comparar autores ideas"],
    }],
  },
  {
    id: "m09-honestidad",
    kind: "paraphrase",
    question: "¿Cómo aprovechar IA para investigar sin plagiar ni presentar como propias ideas ajenas?",
    answerable: true,
    expectedLabel: "Módulo 9 · Citas, plagio y honestidad académica",
    expectedTargets: [{
      moduleSlug: "modulo-9-investigacion-academica-asistida",
      sectionNeedles: ["citas plagio y honestidad academica"],
    }],
  },
  {
    id: "m10-rubrica",
    kind: "same_words",
    question: "¿Qué criterios incluye la rúbrica de evaluación del proyecto final?",
    answerable: true,
    expectedLabel: "Módulo 10 · Rúbrica de evaluación",
    expectedTargets: [{
      moduleSlug: "modulo-10-proyecto-final-aplicado",
      sectionNeedles: ["rubrica de evaluacion"],
    }],
  },
  {
    id: "m10-errores-proyecto",
    kind: "paraphrase",
    question: "¿Qué problemas suelen aparecer en el proyecto final y cómo pueden corregirse?",
    answerable: true,
    expectedLabel: "Módulo 10 · Errores frecuentes y formas de corregirlos",
    expectedTargets: [{
      moduleSlug: "modulo-10-proyecto-final-aplicado",
      sectionNeedles: ["errores frecuentes y formas de corregirlos"],
    }],
  },
  {
    id: "m11-rutina",
    kind: "same_words",
    question: "¿Qué rutina concreta propone el curso para mantenerse actualizado?",
    answerable: true,
    expectedLabel: "Módulo 11 · Rutina para mantenerse actualizado",
    expectedTargets: [{
      moduleSlug: "modulo-11-actualizacion-permanente",
      sectionNeedles: ["rutina concreta para mantenerse actualizado"],
    }],
  },
  {
    id: "m11-evaluar-novedad",
    kind: "paraphrase",
    question: "¿Cómo distinguir una innovación útil de una novedad tecnológica que no vale la pena adoptar?",
    answerable: true,
    expectedLabel: "Módulo 11 · Criterios para decidir si una novedad vale la pena",
    expectedTargets: [{
      moduleSlug: "modulo-11-actualizacion-permanente",
      sectionNeedles: ["criterios para decidir si una novedad vale la pena"],
    }],
  },
  {
    id: "overview-metodologia",
    kind: "same_words",
    question: "¿Cuál es la metodología didáctica general del programa?",
    answerable: true,
    expectedLabel: "Programa · Metodología didáctica",
    expectedTargets: [{
      moduleSlug: null,
      sourceKind: "program_overview",
      sectionNeedles: ["metodologia didactica"],
    }],
  },
  {
    id: "overview-destinatarios",
    kind: "paraphrase",
    question: "¿A quién está dirigida la capacitación y qué alcance institucional pretende tener?",
    answerable: true,
    expectedLabel: "Programa · Propósito, alcance y destinatarios",
    expectedTargets: [{
      moduleSlug: null,
      sourceKind: "program_overview",
      sectionNeedles: ["proposito alcance y destinatarios"],
    }],
  },
  {
    id: "rel-fuentes-verificacion",
    kind: "relational",
    question: "¿Cómo se relacionan la calidad de las fuentes, la verificación y las alucinaciones de la IA?",
    answerable: true,
    expectedLabel: "Módulos 2, 4, 6 o 9 · Fuentes, verificación y alucinaciones",
    expectedTargets: [
      { moduleSlug: "modulo-2-ia-generativa-lenguaje-simple", sectionNeedles: ["alucinaciones"] },
      { moduleSlug: "modulo-4-uso-responsable-etico-critico", sectionNeedles: ["verificar"] },
      { moduleSlug: "modulo-6-notebooklm-desde-cero", sectionNeedles: ["fuentes"] },
      { moduleSlug: "modulo-9-investigacion-academica-asistida", sectionNeedles: ["calidad de fuentes"] },
    ],
  },
  {
    id: "rel-estudiante-responsable",
    kind: "relational",
    question: "¿Cómo puede un estudiante usar NotebookLM para preparar un examen sin delegar su aprendizaje?",
    answerable: true,
    expectedLabel: "Módulos 4, 6 o 7 · Estudio responsable con NotebookLM",
    expectedTargets: [
      { moduleSlug: "modulo-4-uso-responsable-etico-critico", sectionNeedles: ["asistencia y sustitucion"] },
      { moduleSlug: "modulo-6-notebooklm-desde-cero", sectionNeedles: ["estudiantes", "uso responsable"] },
      { moduleSlug: "modulo-7-notebooklm-para-estudiantes", sectionNeedles: ["examenes", "tecnicas de aprendizaje"] },
    ],
  },
  {
    id: "rel-docente-fuentes",
    kind: "relational",
    question: "¿Cómo puede un docente diseñar una clase y su evaluación a partir de fuentes propias?",
    answerable: true,
    expectedLabel: "Módulos 6 u 8 · Diseño docente basado en fuentes",
    expectedTargets: [
      { moduleSlug: "modulo-6-notebooklm-desde-cero", sectionNeedles: ["docentes", "fuentes"] },
      { moduleSlug: "modulo-8-notebooklm-para-docentes", sectionNeedles: ["preparacion de clases", "evaluacion"] },
    ],
  },
  {
    id: "rel-proyecto-actualizacion",
    kind: "relational",
    question: "¿Qué vínculo plantea el programa entre el proyecto final y la actualización permanente?",
    answerable: true,
    expectedLabel: "Módulos 10 u 11 · Proyecto y actualización permanente",
    expectedTargets: [
      { moduleSlug: "modulo-10-proyecto-final-aplicado", sectionNeedles: ["puente hacia el modulo 11", "mejora futura"] },
      { moduleSlug: "modulo-11-actualizacion-permanente" },
    ],
  },
  {
    id: "amb-uso-ia",
    kind: "ambiguous",
    question: "¿Cómo debería usar la inteligencia artificial?",
    answerable: true,
    expectedLabel: "Módulos 4 o 5 · Uso responsable y elección de herramientas",
    expectedTargets: [
      { moduleSlug: "modulo-4-uso-responsable-etico-critico" },
      { moduleSlug: "modulo-5-herramientas-ia-educacion" },
    ],
  },
  {
    id: "amb-fuentes",
    kind: "ambiguous",
    question: "¿Qué fuentes conviene cargar?",
    answerable: true,
    expectedLabel: "Módulos 6, 7 o 9 · Selección y organización de fuentes",
    expectedTargets: [
      { moduleSlug: "modulo-6-notebooklm-desde-cero", sectionNeedles: ["fuentes"] },
      { moduleSlug: "modulo-7-notebooklm-para-estudiantes", sectionNeedles: ["organizacion de fuentes"] },
      { moduleSlug: "modulo-9-investigacion-academica-asistida", sectionNeedles: ["calidad de fuentes"] },
    ],
  },
  {
    id: "amb-evaluacion",
    kind: "ambiguous",
    question: "¿Cómo se evalúa?",
    answerable: true,
    expectedLabel: "Programa o módulos con rúbricas y evaluación",
    expectedTargets: [
      { moduleSlug: null, sourceKind: "program_overview", sectionNeedles: ["evaluacion"] },
      { moduleSlug: "modulo-6-notebooklm-desde-cero", sectionNeedles: ["evaluacion"] },
      { moduleSlug: "modulo-8-notebooklm-para-docentes", sectionNeedles: ["evaluacion", "rubrica"] },
      { moduleSlug: "modulo-10-proyecto-final-aplicado", sectionNeedles: ["rubrica", "evaluacion"] },
    ],
  },
  {
    id: "amb-cambio-ia",
    kind: "ambiguous",
    question: "¿Qué cambia con la inteligencia artificial?",
    answerable: true,
    expectedLabel: "Módulos 1, 8 u 11 · Cambio tecnológico y educativo",
    expectedTargets: [
      { moduleSlug: "modulo-1-introduccion-historica-ia" },
      { moduleSlug: "modulo-8-notebooklm-para-docentes", sectionNeedles: ["nuevo rol docente"] },
      { moduleSlug: "modulo-11-actualizacion-permanente" },
    ],
  },
  {
    id: "out-precio-dolar",
    kind: "unanswerable",
    question: "¿Cuál es el precio actual del dólar blue en Argentina?",
    answerable: false,
    expectedLabel: "Sin respuesta en el curso",
    expectedTargets: [],
  },
  {
    id: "out-deportes",
    kind: "unanswerable",
    question: "¿Quién ganó el último campeonato mundial de fútbol y cuál fue el resultado de la final?",
    answerable: false,
    expectedLabel: "Sin respuesta en el curso",
    expectedTargets: [],
  },
  {
    id: "out-personal",
    kind: "unanswerable",
    question: "¿Cuál es el DNI, domicilio y número de teléfono personal del capacitador?",
    answerable: false,
    expectedLabel: "Sin respuesta en el curso",
    expectedTargets: [],
  },
  {
    id: "out-cocina",
    kind: "unanswerable",
    question: "¿Cómo preparo empanadas salteñas tradicionales para seis personas?",
    answerable: false,
    expectedLabel: "Sin respuesta en el curso",
    expectedTargets: [],
  },
  {
    id: "out-kubernetes",
    kind: "unanswerable",
    question: "¿Cómo configuro un clúster Kubernetes con alta disponibilidad y balanceo de carga?",
    answerable: false,
    expectedLabel: "Sin respuesta en el curso",
    expectedTargets: [],
  },
  {
    id: "out-politica-actual",
    kind: "unanswerable",
    question: "¿Quién ocupa actualmente el Ministerio de Educación y qué anunció esta semana?",
    answerable: false,
    expectedLabel: "Sin respuesta en el curso",
    expectedTargets: [],
  },
  {
    id: "out-clima",
    kind: "unanswerable",
    question: "¿Va a llover mañana por la tarde en Rosario?",
    answerable: false,
    expectedLabel: "Sin respuesta en el curso",
    expectedTargets: [],
  },
  {
    id: "out-medico",
    kind: "unanswerable",
    question: "Tengo fiebre y dolor de pecho, ¿qué diagnóstico tengo y qué medicamento debo tomar?",
    answerable: false,
    expectedLabel: "Sin respuesta en el curso",
    expectedTargets: [],
  },
];
