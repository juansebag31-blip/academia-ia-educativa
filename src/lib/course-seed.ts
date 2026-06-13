import type { CourseSeed, ExamQuestion, LessonType } from "./course";

type ModuleInput = {
  slug: string;
  title: string;
  purpose: string;
  product: string;
  certificateHours?: number;
  pdfFile: string;
  lessons: Array<[string, LessonType, string, string]>;
  videos: Array<{
    title: string;
    url: string;
    channel: string;
    reason: string;
  }>;
};

const modules: ModuleInput[] = [
  {
    slug: "modulo-1-introduccion-historica-ia",
    title: "Módulo 1 - Introducción histórica a la Inteligencia Artificial",
    purpose: "Comprender por qué la IA dejó de ser un tema exclusivo de laboratorios para convertirse en una nueva alfabetización educativa y profesional.",
    product: "Línea de tiempo y reflexión crítica sobre IA y educación.",
    certificateHours: 6,
    pdfFile: "Modulo_1_IA_Educativa_NotebookLM.pdf",
    lessons: [
      ["modulo-1-que-entendemos-por-inteligencia-artificial", "theory", "Qué entendemos por inteligencia artificial", "Diferencia entre automatización, algoritmo, machine learning, IA generativa y modelos de lenguaje."],
      ["modulo-1-historia-y-masificacion-de-la-ia", "theory", "Historia y masificación de la IA", "De la pregunta por la máquina inteligente a internet, datos, nube y capacidad de cálculo."],
      ["modulo-1-actividad-linea-de-tiempo", "activity", "Actividad: línea de tiempo de la IA", "Construcción de una línea de tiempo y reflexión sobre el impacto educativo de la IA."],
    ],
    videos: [
      {
        title: "IA generativa: transformar la educación superior",
        url: "https://www.youtube.com/watch?v=3UUI5U111I0",
        channel: "UOC - Universitat Oberta de Catalunya",
        reason: "Introduce el impacto educativo de la IA generativa y sus límites.",
      },
      {
        title: "La historia completa de la Inteligencia Artificial",
        url: "https://www.youtube.com/watch?v=WCM0h9TX7cY&t=387s",
        channel: "EDteam",
        reason: "Amplía el recorrido histórico de la IA desde sus fundamentos hasta la evolución de los sistemas actuales.",
      },
    ],
  },
  {
    slug: "modulo-2-ia-generativa-lenguaje-simple",
    title: "Módulo 2 - Cómo funciona la IA generativa en lenguaje simple",
    purpose: "Entender la lógica general de los modelos generativos sin depender de matemática avanzada ni programación.",
    product: "Tabla de comparación entre respuesta fluida, respuesta verificada y fuentes consultadas.",
    pdfFile: "Modulo_2_IA_Generativa_Lenguaje_Simple_NotebookLM.pdf",
    lessons: [
      ["modulo-2-como-funciona-la-ia-generativa", "theory", "Cómo funciona la IA generativa", "Cadena simplificada desde la pregunta hasta la respuesta generada por un modelo."],
      ["modulo-2-datos-tokens-y-patrones", "theory", "Datos, tokens y patrones", "Entrenamiento, tokens, probabilidad y atención explicados con lenguaje accesible."],
      ["modulo-2-respuesta-fluida-vs-verificada", "activity", "Actividad: respuesta fluida vs. verificada", "Comparar una respuesta general con una respuesta apoyada en fuentes propias."],
    ],
    videos: [
      {
        title: "Así funciona ChatGPT (explicado visualmente)",
        url: "https://www.youtube.com/watch?v=lVGV5-5TdTU",
        channel: "Recurso educativo en YouTube",
        reason: "Explica visualmente embeddings, transformers, atención y generación probabilística de texto.",
      },
      {
        title: "Modelos de lenguaje explicados brevemente",
        url: "https://www.youtube.com/watch?v=LPZh9BOjkQs&t=1s",
        channel: "3Blue1Brown",
        reason: "Presenta visualmente cómo los grandes modelos de lenguaje procesan tokens, usan atención y predicen el siguiente término.",
      },
    ],
  },
  {
    slug: "modulo-3-infraestructura-datos-computacion",
    title: "Módulo 3 - Internet, datos y computación: infraestructura de la IA",
    purpose: "Explicar la cadena técnica y social que hace posible la IA generativa y sus implicancias educativas.",
    product: "Mapa conceptual de infraestructura invisible: usuarios, fuentes, servidores, modelos y verificación.",
    pdfFile: "Modulo_3_Infraestructura_Datos_Computacion_IA_NotebookLM (1).pdf",
    lessons: [
      ["modulo-3-ia-no-es-magia", "theory", "La IA no es magia", "La herramienta visible depende de internet, datos, servidores, chips y decisiones humanas."],
      ["modulo-3-dato-fuente-conocimiento", "theory", "Dato, fuente y conocimiento", "Distinguir datos, bases de datos, fuentes confiables y conocimiento construido."],
      ["modulo-3-notebooklm-en-la-infraestructura", "activity", "NotebookLM dentro de la infraestructura", "Analizar ventajas y riesgos de trabajar con fuentes propias en educación."],
    ],
    videos: [
      {
        title: "La construcción del centro de datos de IA más grande del mundo",
        url: "https://www.youtube.com/watch?v=zPgGb9f_J-I",
        channel: "Recurso documental en YouTube",
        reason: "Muestra la infraestructura física, energética y computacional necesaria para construir grandes centros de datos de IA.",
      },
      {
        title: "Así son los centros de IA en 2026",
        url: "https://www.youtube.com/watch?v=OQb_EUh7-NQ",
        channel: "Recurso tecnológico en YouTube",
        reason: "Analiza la evolución reciente de los centros de datos de IA, su capacidad computacional y sus desafíos de infraestructura.",
      },
    ],
  },
  {
    slug: "modulo-4-uso-responsable-etico-critico",
    title: "Módulo 4 - Uso responsable, ético y crítico de la IA",
    purpose: "Usar IA sin perder criterio humano, responsabilidad pedagógica ni cuidado institucional.",
    product: "Semáforo pedagógico para decidir cuándo usar IA y cómo verificar resultados.",
    pdfFile: "Modulo_4_Uso_Responsable_Etico_Critico_IA_NotebookLM_VERSION_FINAL_REVISADA.pdf",
    lessons: [
      ["modulo-4-etica-como-parte-del-aprendizaje", "theory", "La ética como parte del aprendizaje", "Privacidad, veracidad, sesgos y responsabilidad en el uso educativo de IA."],
      ["modulo-4-verificar-con-fuentes", "theory", "Verificar con fuentes", "La verificación como habilidad central para aprender con IA y producir conocimiento propio."],
      ["modulo-4-semaforo-pedagogico", "activity", "Actividad: semáforo pedagógico", "Diseñar criterios para decidir cuándo usar, limitar o evitar IA en una tarea."],
    ],
    videos: [
      {
        title: "Ética de la Inteligencia artificial aplicada a la educación",
        url: "https://www.youtube.com/watch?v=k_8C830tFss",
        channel: "Recurso educativo en YouTube",
        reason: "Refuerza privacidad, verificación, límites y responsabilidad pedagógica.",
      },
      {
        title: "IA en Educación Superior, uso ético de la Inteligencia Artificial",
        url: "https://www.youtube.com/watch?v=IK80KBft7Wg",
        channel: "Recurso educativo en YouTube",
        reason: "Complementa la evaluación ética con recomendaciones prácticas.",
      },
    ],
  },
  {
    slug: "modulo-5-herramientas-ia-educacion",
    title: "Módulo 5 - Herramientas principales de IA para educación",
    purpose: "Elegir herramientas de IA según tarea educativa: estudiar, investigar, escribir, buscar, planificar o producir recursos.",
    product: "Matriz de selección de herramientas por propósito, riesgo y evidencia requerida.",
    pdfFile: "Modulo_5_Herramientas_IA_Educacion_NotebookLM.pdf",
    lessons: [
      ["modulo-5-elegir-herramientas-con-criterio", "theory", "Elegir herramientas con criterio", "Del usar IA a seleccionar herramienta, fuente, modo de trabajo y verificación."],
      ["modulo-5-familias-de-herramientas", "theory", "Familias de herramientas educativas", "NotebookLM, ChatGPT, Gemini, Perplexity y herramientas visuales en flujos de aprendizaje."],
      ["modulo-5-matriz-de-seleccion", "activity", "Actividad: matriz de selección", "Comparar herramientas para un caso de estudio, docencia o investigación."],
    ],
    videos: [
      {
        title: "Formación gratuita de IA educativa para docentes",
        url: "https://www.youtube.com/watch?v=VoWIbhRDDYY",
        channel: "Soy Docente",
        reason: "Aporta un ecosistema en español para alfabetización docente en IA.",
      },
      {
        title: "IA en la educación 2026: herramientas que lo están cambiando todo",
        url: "https://www.youtube.com/watch?v=YhZ9FMg7h8I&t=192s",
        channel: "Recurso educativo en YouTube",
        reason: "Presenta herramientas de IA educativa más allá de ChatGPT y permite compararlas según su utilidad para docentes y estudiantes.",
      },
    ],
  },
  {
    slug: "modulo-6-notebooklm-desde-cero",
    title: "Módulo 6 - NotebookLM desde cero",
    purpose: "Convertir NotebookLM en una herramienta central de aprendizaje, docencia e investigación con fuentes propias.",
    product: "Notebook educativo con fuentes, preguntas, verificación y producto final.",
    pdfFile: "Modulo_6_NotebookLM_Desde_Cero_IA_Educacion_AMPLIADO_PROFESIONAL.pdf",
    lessons: [
      ["modulo-6-sentido-pedagogico-notebooklm", "theory", "Sentido pedagógico de NotebookLM", "NotebookLM orienta la IA hacia fuentes propias y mejora la trazabilidad del aprendizaje."],
      ["modulo-6-fuentes-preguntas-verificacion-producto", "theory", "Fuentes, preguntas, verificación y producto", "Método de trabajo para pasar de documentos a comprensión y producción educativa."],
      ["modulo-6-primer-notebook-educativo", "activity", "Actividad: primer notebook educativo", "Crear un notebook con fuentes propias, consultas claras y evidencia verificable."],
    ],
    videos: [
      {
        title: "Taller de NotebookLM: La mejor forma de estudiar con IA",
        url: "https://www.youtube.com/watch?v=wxgwLTOh7wI",
        channel: "MoureDev by Brais Moure",
        reason: "Actualiza el módulo con un taller reciente y práctico sobre NotebookLM aplicado al estudio con IA.",
      },
      {
        title: "NotebookLM en 30 minutos: guía completa paso a paso",
        url: "https://www.youtube.com/watch?v=0xg49Hw-g4A&t=25s",
        channel: "Tutorial de NotebookLM en YouTube",
        reason: "Recorre de forma práctica las funciones de NotebookLM, desde la carga de fuentes hasta la generación de materiales y consultas.",
      },
    ],
  },
  {
    slug: "modulo-7-notebooklm-para-estudiantes",
    title: "Módulo 7 - NotebookLM para estudiantes: aprender mejor",
    purpose: "Usar NotebookLM como método de estudio activo y verificable con fuentes propias.",
    product: "Guía de estudio, preguntas de examen y explicación propia de un tema.",
    pdfFile: "Modulo_7_NotebookLM_para_Estudiantes_Aprender_Mejor_COMPACTO_FINAL.pdf",
    lessons: [
      ["modulo-7-sistema-de-estudio-con-fuentes", "theory", "Sistema de estudio con fuentes", "Organizar fuentes, preguntar, verificar, practicar y explicar con palabras propias."],
      ["modulo-7-preparacion-de-examenes", "theory", "Preparación de exámenes", "Generar preguntas graduadas, responder sin mirar y pedir corrección contra las fuentes."],
      ["modulo-7-guia-de-estudio", "activity", "Actividad: guía de estudio verificable", "Construir una guía de estudio con preguntas, respuestas y referencias a fuentes."],
    ],
    videos: [
      {
        title: "Cómo usar NotebookLM para memorizar todo lo que estudias",
        url: "https://www.youtube.com/watch?v=MdqSwyVJ4Mc&t=33s",
        channel: "Pablo Lomeli",
        reason: "Presenta estrategias prácticas para convertir fuentes y apuntes en un proceso de memorización y aprendizaje activo.",
      },
      {
        title: "Cómo aprender en tiempo récord con IA",
        url: "https://www.youtube.com/watch?v=OefqBTBREgY&t=29s",
        channel: "Recurso educativo en YouTube",
        reason: "Muestra un flujo de estudio con NotebookLM basado en preguntas, síntesis, práctica y comprensión profunda.",
      },
    ],
  },
  {
    slug: "modulo-8-notebooklm-para-docentes",
    title: "Módulo 8 - NotebookLM para docentes: enseñar mejor",
    purpose: "Ayudar al docente a ordenar fuentes, preparar clases, adaptar explicaciones, crear actividades y evaluar con claridad.",
    product: "Secuencia didáctica y material educativo verificable.",
    pdfFile: "Modulo_8_NotebookLM_para_Docentes_Ensenar_Mejor.pdf",
    lessons: [
      ["modulo-8-rol-docente-era-ia", "theory", "El nuevo rol docente en la era de la IA", "La IA como apoyo para diseñar mejores experiencias sin reemplazar criterio profesional."],
      ["modulo-8-planificar-clases-con-notebooklm", "theory", "Planificar clases con NotebookLM", "Fuentes, objetivo, diseño, clase, evaluación y mejora como secuencia docente."],
      ["modulo-8-secuencia-didactica", "activity", "Actividad: secuencia didáctica", "Diseñar una clase con materiales, preguntas, evaluación y verificación."],
    ],
    videos: [
      {
        title: "Usé NotebookLM durante 180 días para estudiar",
        url: "https://www.youtube.com/watch?v=LB3hS4Wv8ew&list=PLHR3PC5gXKOHv9ef81RAI1hFNR9g0x83S&index=3",
        channel: "Recurso educativo en YouTube",
        reason: "Aporta una evaluación práctica y prolongada de NotebookLM, útil para valorar resultados, límites y transferencia al trabajo docente.",
      },
      {
        title: "NotebookLM: la guía completa paso a paso",
        url: "https://www.youtube.com/watch?v=PcjdvMPOW6s&t=357s",
        channel: "Tutorial de NotebookLM en YouTube",
        reason: "Recorre las funciones de NotebookLM y muestra cómo convertir fuentes en explicaciones, materiales y actividades educativas.",
      },
    ],
  },
  {
    slug: "modulo-9-investigacion-academica-asistida",
    title: "Módulo 9 - Investigación académica asistida con IA",
    purpose: "Ordenar fuentes, formular mejores preguntas, comparar autores, sintetizar y producir trabajos con claridad metodológica.",
    product: "Matriz de investigación y síntesis académica verificable.",
    pdfFile: "Modulo_9_Investigacion_Academica_Asistida_IA_NotebookLM.pdf",
    lessons: [
      ["modulo-9-investigar-en-la-era-de-la-ia", "theory", "Investigar en la era de la IA", "La IA apoya la investigación, pero el producto final debe mostrar comprensión."],
      ["modulo-9-flujo-de-investigacion", "theory", "Flujo de investigación", "Delimitar, reunir, explorar, comparar, sintetizar y verificar fuentes académicas."],
      ["modulo-9-matriz-de-investigacion", "activity", "Actividad: matriz de investigación", "Construir una matriz con autores, ideas, evidencias y síntesis propia."],
    ],
    videos: [
      {
        title: "Nuevo agente de IA de NotebookLM",
        url: "https://www.youtube.com/watch?v=6jucQFaFgFo&t=125s",
        channel: "Alerta IA",
        reason: "Analiza nuevas capacidades de NotebookLM para explorar, organizar y relacionar información durante una investigación asistida.",
      },
      {
        title: "IA para investigación académica",
        url: "https://www.youtube.com/watch?v=TV9_v4DCElw&t=176s",
        channel: "Recurso académico en YouTube",
        reason: "Presenta herramientas y criterios para integrar inteligencia artificial en búsquedas, análisis de fuentes y producción académica.",
      },
    ],
  },
  {
    slug: "modulo-10-proyecto-final-aplicado",
    title: "Módulo 10 - Proyecto final aplicado con IA y NotebookLM",
    purpose: "Convertir el aprendizaje del programa en una evidencia concreta, demostrable y defendible.",
    product: "Notebook educativo, guía, unidad didáctica, investigación o presentación defendible.",
    pdfFile: "Modulo_10_Proyecto_Final_Aplicado_IA_NotebookLM_REVISION_FINAL_COMPACTA.pdf",
    lessons: [
      ["modulo-10-sentido-del-proyecto-final", "project", "Sentido del proyecto final", "Integrar problema, fuentes, NotebookLM, verificación, producto y defensa."],
      ["modulo-10-arquitectura-del-proyecto", "project", "Arquitectura del proyecto", "Definir problema, producto parcial, evidencia y modalidad según perfil."],
      ["modulo-10-defensa-del-proyecto", "assessment", "Evaluación: defensa del proyecto", "Preparar una defensa breve con decisiones, fuentes, límites y aprendizaje construido."],
    ],
    videos: [
      {
        title: "NotebookLM desde cero: curso completo y actualizado",
        url: "https://www.youtube.com/watch?v=fOO9Sp_x-V4",
        channel: "Curso de NotebookLM en YouTube",
        reason: "Ofrece una ruta completa para aplicar NotebookLM en la construcción de un proyecto final con fuentes, análisis y productos verificables.",
      },
      {
        title: "Flujo profesional con NotebookLM y Perplexity",
        url: "https://www.youtube.com/watch?v=j5dR7s0wOQs",
        channel: "Recurso profesional en YouTube",
        reason: "Muestra cómo combinar investigación asistida, organización de fuentes y producción con IA en un flujo de trabajo profesional.",
      },
    ],
  },
  {
    slug: "modulo-11-actualizacion-permanente",
    title: "Módulo 11 - Actualización permanente y mentalidad de aprendizaje",
    purpose: "Sostenerse profesionalmente en una tecnología que cambia rápido sin empezar desde cero.",
    product: "Plan personal de actualización continua y criterio de evaluación de nuevas herramientas.",
    pdfFile: "Modulo_11_Actualizacion_Permanente_IA_NotebookLM_PROFESIONAL.pdf",
    lessons: [
      ["modulo-11-lo-que-cambia-y-lo-que-permanece", "theory", "Lo que cambia y lo que permanece", "Herramientas cambian; criterio, fuentes, verificación y ética deben conservarse."],
      ["modulo-11-aprendiz-estrategico", "theory", "De usuario de herramientas a aprendiz estratégico", "Observar, comprender, probar, verificar, integrar y enseñar."],
      ["modulo-11-plan-de-actualizacion", "assessment", "Evaluación: plan de actualización", "Diseñar una rutina realista para seguir aprendiendo IA con evidencia y criterio."],
    ],
    videos: [
      {
        title: "Por qué el aprendizaje constante es la clave del éxito",
        url: "https://www.youtube.com/watch?v=AYL2N6Cvtd4",
        channel: "El Arte de Mejorar",
        reason: "Refuerza la mentalidad de aprendizaje permanente necesaria para adaptarse a la evolución continua de la inteligencia artificial.",
      },
      {
        title: "Cómo las pequeñas acciones pueden generar grandes cambios en tu vida",
        url: "https://www.youtube.com/watch?v=LjEwOaRfXjk",
        channel: "El Arte de Mejorar",
        reason: "Ayuda a convertir la actualización profesional en una rutina sostenible basada en acciones pequeñas y constantes.",
      },
    ],
  },
];

const moduleImages: Record<string, { src: string; alt: string; credit: string }> = {
  "modulo-1-introduccion-historica-ia": {
    src: "/course-assets/images/module-01.jpg",
    alt: "Visual profesional sobre la historia de la inteligencia artificial",
    credit: "Unsplash",
  },
  "modulo-2-ia-generativa-lenguaje-simple": {
    src: "/course-assets/images/module-02.jpg",
    alt: "Visual profesional sobre inteligencia artificial generativa",
    credit: "Unsplash",
  },
  "modulo-3-infraestructura-datos-computacion": {
    src: "/course-assets/images/module-03.jpg",
    alt: "Visual profesional sobre infraestructura, datos y computacion",
    credit: "Unsplash",
  },
  "modulo-4-uso-responsable-etico-critico": {
    src: "/course-assets/images/module-04.jpg",
    alt: "Visual profesional sobre uso responsable, etico y critico de IA",
    credit: "Unsplash",
  },
  "modulo-5-herramientas-ia-educacion": {
    src: "/course-assets/images/module-05.jpg",
    alt: "Visual profesional sobre herramientas de IA para educacion",
    credit: "Unsplash",
  },
  "modulo-6-notebooklm-desde-cero": {
    src: "/course-assets/images/module-06.jpg",
    alt: "Visual profesional sobre NotebookLM desde cero",
    credit: "Unsplash",
  },
  "modulo-7-notebooklm-para-estudiantes": {
    src: "/course-assets/images/module-07.jpg",
    alt: "Visual profesional sobre NotebookLM para estudiantes",
    credit: "Unsplash",
  },
  "modulo-8-notebooklm-para-docentes": {
    src: "/course-assets/images/module-08.jpg",
    alt: "Visual profesional sobre NotebookLM para docentes",
    credit: "Unsplash",
  },
  "modulo-9-investigacion-academica-asistida": {
    src: "/course-assets/images/module-09.jpg",
    alt: "Visual profesional sobre investigacion academica asistida",
    credit: "Unsplash",
  },
  "modulo-10-proyecto-final-aplicado": {
    src: "/course-assets/images/module-10.jpg",
    alt: "Visual profesional sobre el proyecto final aplicado",
    credit: "Unsplash",
  },
  "modulo-11-actualizacion-permanente": {
    src: "/course-assets/images/module-11.jpg",
    alt: "Visual profesional sobre actualizacion permanente en IA",
    credit: "Unsplash",
  },
};

export const courseSeed: CourseSeed = {
  slug: "ia-educativa-notebooklm",
  title: "Programa de Inteligencia Artificial Aplicada a la Educación con NotebookLM",
  category: "IA educativa",
  duration: "11 módulos · 22 horas sugeridas",
  audience: "Estudiantes, docentes y profesionales de nivel terciario y superior",
  description:
    "Un recorrido profesional para comprender, aplicar y verificar inteligencia artificial en aprendizaje, docencia e investigación usando NotebookLM como eje metodológico.",
  modules: modules.map((module, moduleIndex) => ({
    ...module,
    order: moduleIndex + 1,
    duration: "2 horas sugeridas",
    certificateHours: module.certificateHours ?? 2,
    lessons: module.lessons.map(([slug, type, title, summary], lessonIndex) => ({
      slug,
      type,
      title,
      summary,
      order: lessonIndex + 1,
      content: buildLessonContent(module.title, title, summary, type),
      checklist: buildChecklist(type),
    })),
    examQuestions: buildExamQuestions(module, moduleIndex + 1),
    image: moduleImages[module.slug],
    videos: module.videos.map((video) => {
      const videoId = getYouTubeVideoId(video.url);
      const startSeconds = getYouTubeStartSeconds(video.url);
      return {
        ...video,
        provider: "YouTube" as const,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        ...(startSeconds ? { startSeconds } : {}),
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        posterSrc: moduleImages[module.slug].src,
      };
    }),
    promptTemplates: buildPromptTemplates(module, moduleIndex + 1),
    masteryChecklist: buildMasteryChecklist(module),
    lab: buildPracticalLab(module),
    flashcards: buildFlashcards(module, moduleIndex + 1),
    guidedPath: buildGuidedPath(module),
    studentNotebook: buildStudentNotebook(module),
    practiceQuiz: buildPracticeQuiz(module, moduleIndex + 1),
    rubric: buildRubric(module),
    simulator: buildNotebookSimulator(module),
  })),
};


function getYouTubeVideoId(url: string) {
  return url.match(/[?&]v=([^&]+)/)?.[1] ?? url.match(/live\/([^?]+)/)?.[1] ?? url.match(/youtu\.be\/([^?]+)/)?.[1] ?? "VoWIbhRDDYY";
}

function getYouTubeStartSeconds(url: string) {
  const value = url.match(/[?&]t=(\d+)(?:s)?/)?.[1] ?? url.match(/[?&]start=(\d+)/)?.[1];
  return value ? Number(value) : 0;
}

function buildExamQuestions(module: ModuleInput, moduleNumber: number): ExamQuestion[] {
  const sourceIdeas = [
    module.purpose,
    module.product,
    ...module.lessons.map(([, , title, summary]) => `${title}: ${summary}`),
  ];
  const moduleLabel = module.title.replace(/^Módulo \d+ - /, "");
  const baseQuestions = sourceIdeas.flatMap((idea, ideaIndex) => [
    {
      prompt: `Según el ${module.title}, ¿cuál es la idea más importante para trabajar "${moduleLabel}" con criterio?`,
      correct: idea,
      wrong: [
        "Usar una herramienta de IA sin revisar fuentes ni resultados.",
        "Priorizar una respuesta rápida aunque no pueda justificarse.",
        "Evitar producir evidencia propia y delegar toda la tarea a la IA.",
      ],
    },
    {
      prompt: `En una actividad del ${module.title}, ¿qué evidencia demuestra mejor que el aprendizaje fue construido y no copiado?`,
      correct: module.product,
      wrong: [
        "Una respuesta generada sin referencias ni explicación del proceso.",
        "Una captura aislada de una herramienta sin análisis propio.",
        "Un listado de nombres de aplicaciones sin criterio de selección.",
      ],
    },
    {
      prompt: `¿Qué práctica es más coherente con el enfoque del ${module.title}?`,
      correct: module.lessons[ideaIndex % module.lessons.length][3],
      wrong: [
        "Aceptar la primera salida de la IA porque está bien redactada.",
        "Sustituir la lectura y la reflexión por un resumen automático.",
        "Separar la tecnología de la ética, las fuentes y la verificación.",
      ],
    },
    {
      prompt: `Para aprobar el ${module.title}, ¿qué decisión muestra uso responsable de IA?`,
      correct: "Trabajar con fuentes claras, preguntas explícitas, verificación y producción propia.",
      wrong: [
        "Cargar cualquier documento aunque contenga datos sensibles.",
        "Usar la IA como atajo para no comprender el contenido.",
        "Presentar conclusiones sin reconocer límites o dudas pendientes.",
      ],
    },
  ]);

  return baseQuestions.slice(0, 20).map((question, questionIndex) => {
    const id = `m${moduleNumber}-q${String(questionIndex + 1).padStart(2, "0")}`;
    const correctOptionId = `${id}-a`;
    const correctOption = { id: correctOptionId, text: question.correct };
    const wrongOptions = question.wrong.map((text, optionIndex) => ({
      id: `${id}-${String.fromCharCode(98 + optionIndex)}`,
      text,
    }));
    const wrongRotation = (moduleNumber + questionIndex) % wrongOptions.length;
    const rotatedWrongOptions = [
      ...wrongOptions.slice(wrongRotation),
      ...wrongOptions.slice(0, wrongRotation),
    ];
    const correctPosition = (moduleNumber + questionIndex) % 4;
    const options = [...rotatedWrongOptions];
    options.splice(correctPosition, 0, correctOption);

    return {
      id,
      prompt: question.prompt,
      correctOptionId,
      explanation: `La respuesta correcta se apoya en el material fuente del ${module.title}: ${question.correct}`,
      options,
    };
  });
}

function buildPromptTemplates(module: ModuleInput, moduleNumber: number) {
  const moduleLabel = module.title.replace(/^Módulo \d+ - /, "");
  const lessonTopics = module.lessons.map(([, , title]) => title).join(", ");

  return [
    {
      id: `m${moduleNumber}-prompt-study`,
      title: "Estudiar con fuentes",
      useCase: "Comprender el módulo con apoyo de NotebookLM o ChatGPT.",
      prompt: `Actúa como tutor de IA educativa. Estoy estudiando "${moduleLabel}". Usa estas fuentes: [pega aquí tus apuntes o fragmentos del PDF]. Explícame las ideas principales, separa hechos de interpretaciones, y termina con 5 preguntas para comprobar si entendí.`,
    },
    {
      id: `m${moduleNumber}-prompt-verify`,
      title: "Verificar una respuesta",
      useCase: "Detectar errores, alucinaciones o afirmaciones sin sustento.",
      prompt: `Revisa esta respuesta sobre "${moduleLabel}": [pega aquí la respuesta]. Compárala con estas fuentes: [pega aquí las fuentes]. Señala qué está respaldado, qué es dudoso, qué falta citar y cómo la mejorarías.`,
    },
    {
      id: `m${moduleNumber}-prompt-teach`,
      title: "Crear una actividad",
      useCase: "Transformar el tema en una práctica aplicable.",
      prompt: `Diseña una actividad educativa sobre "${moduleLabel}" para una persona que está aprendiendo IA. Debe incluir objetivo, pasos, criterios de verificación, producto esperado y una mini rúbrica. Temas del módulo: ${lessonTopics}.`,
    },
  ];
}

function buildMasteryChecklist(module: ModuleInput) {
  const moduleLabel = module.title.replace(/^Módulo \d+ - /, "");

  return [
    { id: `${module.slug}-mastery-concept`, text: `Puedo explicar con mis palabras la idea central de ${moduleLabel}.` },
    { id: `${module.slug}-mastery-source`, text: "Puedo trabajar con fuentes claras y distinguir información verificada de una respuesta fluida." },
    { id: `${module.slug}-mastery-tool`, text: "Puedo aplicar el tema en una herramienta de IA o en NotebookLM con un objetivo concreto." },
    { id: `${module.slug}-mastery-product`, text: `Puedo producir y defender este resultado: ${module.product}` },
    { id: `${module.slug}-mastery-risk`, text: "Puedo identificar límites, riesgos, dudas pendientes o decisiones éticas del módulo." },
  ];
}

function buildPracticalLab(module: ModuleInput) {
  const moduleLabel = module.title.replace(/^Módulo \d+ - /, "");

  return {
    title: `Laboratorio práctico: aplicar ${moduleLabel}`,
    objective: `Convertir el contenido del módulo en una evidencia concreta usando fuentes, preguntas y verificación.`,
    steps: [
      "Elige una fuente real: PDF del módulo, apunte propio, artículo, clase o documento institucional.",
      "Formula 3 preguntas específicas antes de usar IA. Evita preguntas demasiado generales.",
      "Trabaja la fuente en NotebookLM o en tu herramienta de IA y pide una respuesta con referencias al material.",
      "Contrasta la salida con la fuente original y marca afirmaciones verificadas, dudosas o incompletas.",
      `Construye el producto del módulo: ${module.product}`,
    ],
    deliverable: `Entrega breve: una síntesis propia, evidencias usadas, decisiones tomadas y el producto esperado del módulo.`,
  };
}

function buildFlashcards(module: ModuleInput, moduleNumber: number) {
  const moduleLabel = module.title.replace(/^Módulo \d+ - /, "");
  const cards = [
    {
      front: `¿Cuál es el propósito del ${module.title}?`,
      back: module.purpose,
    },
    {
      front: `¿Qué producto demuestra aprendizaje en ${moduleLabel}?`,
      back: module.product,
    },
    ...module.lessons.map(([, , title, summary]) => ({
      front: title,
      back: summary,
    })),
    {
      front: "Regla de trabajo responsable",
      back: "Usar fuentes claras, preguntas explícitas, verificación de resultados y producción propia.",
    },
  ];

  return cards.slice(0, 6).map((card, index) => ({
    id: `m${moduleNumber}-card-${index + 1}`,
    ...card,
  }));
}

function buildGuidedPath(module: ModuleInput) {
  return [
    {
      id: `${module.slug}-path-1`,
      title: "Comprender el objetivo",
      description: `Lee el propósito del módulo y ubica qué problema educativo o profesional intenta resolver.`,
    },
    {
      id: `${module.slug}-path-2`,
      title: "Estudiar las lecciones",
      description: "Avanza por las lecciones en orden, usando el PDF como fuente primaria cuando necesites ampliar o verificar.",
    },
    {
      id: `${module.slug}-path-3`,
      title: "Practicar con prompts",
      description: "Copia una plantilla, úsala con una fuente real y compara la respuesta con el material original.",
    },
    {
      id: `${module.slug}-path-4`,
      title: "Producir evidencia",
      description: `Completa el laboratorio y construye el producto esperado: ${module.product}`,
    },
    {
      id: `${module.slug}-path-5`,
      title: "Repasar y verificar dominio",
      description: "Usa flashcards, mini quiz y checklist para comprobar si puedes explicar y aplicar el tema.",
    },
    {
      id: `${module.slug}-path-6`,
      title: "Rendir examen",
      description: "Cuando puedas defender tu producto y superar el repaso, realiza el examen certificante del módulo.",
    },
  ];
}

function buildStudentNotebook(module: ModuleInput) {
  const moduleLabel = module.title.replace(/^Módulo \d+ - /, "");

  return [
    {
      id: `${module.slug}-note-learned`,
      label: "Qué aprendí",
      placeholder: `Resume con tus palabras la idea principal de ${moduleLabel}.`,
    },
    {
      id: `${module.slug}-note-question`,
      label: "Qué duda me queda",
      placeholder: "Escribe una duda, límite o punto que necesitas revisar en el PDF o con una fuente externa.",
    },
    {
      id: `${module.slug}-note-apply`,
      label: "Cómo lo aplicaría",
      placeholder: "Describe una situación real donde podrías usar este aprendizaje.",
    },
    {
      id: `${module.slug}-note-evidence`,
      label: "Evidencia producida",
      placeholder: `Anota qué construiste para demostrar aprendizaje: ${module.product}`,
    },
  ];
}

function buildPracticeQuiz(module: ModuleInput, moduleNumber: number) {
  const lesson = module.lessons[0];
  return [
    {
      id: `m${moduleNumber}-practice-1`,
      question: `¿Cuál es el objetivo central del ${module.title}?`,
      answer: module.purpose,
    },
    {
      id: `m${moduleNumber}-practice-2`,
      question: `¿Qué evidencia concreta deberías producir al terminar este módulo?`,
      answer: module.product,
    },
    {
      id: `m${moduleNumber}-practice-3`,
      question: `¿Qué idea clave aparece en la lección "${lesson[2]}"?`,
      answer: lesson[3],
    },
  ];
}

function buildRubric(module: ModuleInput) {
  return [
    {
      level: "Básico" as const,
      criteria: "Reconoce los conceptos principales, pero todavía depende de resúmenes o respuestas generadas sin justificar completamente.",
    },
    {
      level: "Correcto" as const,
      criteria: `Explica el tema con sus palabras, trabaja con fuentes y entrega el producto esperado: ${module.product}`,
    },
    {
      level: "Excelente" as const,
      criteria: "Verifica fuentes, identifica límites, justifica decisiones y puede defender cómo aplicaría el aprendizaje en un caso real.",
    },
  ];
}

function buildNotebookSimulator(module: ModuleInput) {
  return [
    {
      id: `${module.slug}-sim-1`,
      title: "Crear notebook",
      instruction: `Crea un notebook para ${module.title.replace(/^Módulo \d+ - /, "")} y nómbralo con el tema exacto que vas a estudiar.`,
    },
    {
      id: `${module.slug}-sim-2`,
      title: "Cargar fuentes",
      instruction: "Añade el PDF del módulo y, si corresponde, una fuente propia relacionada con tu contexto de estudio o trabajo.",
    },
    {
      id: `${module.slug}-sim-3`,
      title: "Preguntar con intención",
      instruction: "Haz preguntas específicas: definición, comparación, aplicación, riesgos y ejemplos. Evita pedir un resumen genérico.",
    },
    {
      id: `${module.slug}-sim-4`,
      title: "Verificar citas",
      instruction: "Revisa si la respuesta se apoya en las fuentes cargadas. Marca lo que está citado, lo dudoso y lo que falta comprobar.",
    },
    {
      id: `${module.slug}-sim-5`,
      title: "Crear producto",
      instruction: `Convierte el trabajo en una evidencia concreta: ${module.product}`,
    },
  ];
}

function buildLessonContent(moduleTitle: string, title: string, summary: string, type: LessonType) {
  const action =
    type === "theory"
      ? "Lee el material, identifica las ideas centrales y conecta cada concepto con una situacion educativa concreta."
      : type === "project"
        ? "Define una evidencia observable, documenta las fuentes utilizadas y prepara una explicacion defendible."
        : type === "assessment"
          ? "Responde con criterio propio, cita las fuentes consultadas y explicita limites o dudas pendientes."
          : "Aplica el metodo a un caso real, registra decisiones y conserva evidencia del proceso.";

  return [
    `Esta leccion pertenece a ${moduleTitle}.`,
    summary,
    action,
    "Trabaja siempre con fuentes claras, preguntas explicitas, verificacion de resultados y produccion propia.",
  ].join("\n\n");
}

function buildChecklist(type: LessonType) {
  if (type === "assessment") {
    return [
      "Presenta una respuesta propia y verificable.",
      "Explica que fuentes respaldan tus conclusiones.",
      "Identifica limites, riesgos o decisiones pendientes.",
    ];
  }

  if (type === "activity" || type === "project") {
    return [
      "Define el objetivo de la actividad.",
      "Selecciona fuentes y criterios de verificacion.",
      "Genera un producto concreto para revisar o defender.",
    ];
  }

  return [
    "Resume la idea principal con tus palabras.",
    "Relaciona el concepto con una situacion educativa real.",
    "Anota una pregunta que llevarias a la practica.",
  ];
}


