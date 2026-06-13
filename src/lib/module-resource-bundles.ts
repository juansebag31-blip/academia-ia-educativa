export type ModuleVisualResource = {
  id: string;
  kind: "Infografía" | "Mapa sistémico" | "Mapa mental";
  src: string;
  title: string;
  description: string;
  alt: string;
  width: number;
  height: number;
};

export type ModuleDocumentResource = {
  id: string;
  kind: "Presentación" | "Guía de estudio";
  src: string;
  title: string;
  description: string;
  pages: number;
};

export type ModuleResourceBundle = {
  moduleSlug: string;
  eyebrow: string;
  title: string;
  introduction: string;
  media: {
    video: {
      src: string;
      title: string;
      description: string;
      duration: string;
      type: "video/mp4";
      poster: string;
    };
    audio: {
      src: string;
      title: string;
      description: string;
      duration: string;
      type: "audio/mp4";
    };
  };
  visuals: ModuleVisualResource[];
  documents: ModuleDocumentResource[];
};

const moduleResourceBundles: Record<string, ModuleResourceBundle> = {
  "modulo-1-introduccion-historica-ia": {
    moduleSlug: "modulo-1-introduccion-historica-ia",
    eyebrow: "Recursos NotebookLM · Módulo 1",
    title: "Explora la evolución y arquitectura de la IA",
    introduction:
      "Una biblioteca multimedia creada a partir de las fuentes del módulo para introducir, repasar y verificar sus conceptos centrales.",
    media: {
      video: {
        src: "/course-assets/modules/module-01/media/alfabetizacion-en-ia.mp4",
        title: "Alfabetización en inteligencia artificial",
        description:
          "Explicación audiovisual de la evolución histórica, los conceptos fundamentales y el enfoque crítico necesario para comprender la IA.",
        duration: "6:53",
        type: "video/mp4",
        poster: "/course-assets/modules/module-01/visuals/arquitectura-ia-educativa.png",
      },
      audio: {
        src: "/course-assets/modules/module-01/media/la-ia-no-sabe-pensar.m4a",
        title: "La inteligencia artificial no sabe pensar",
        description:
          "Conversación de repaso sobre las diferencias entre fluidez, predicción, comprensión y criterio humano.",
        duration: "15:29",
        type: "audio/mp4",
      },
    },
    visuals: [
      {
        id: "arquitectura-ia-educativa",
        kind: "Infografía",
        src: "/course-assets/modules/module-01/visuals/arquitectura-ia-educativa.png",
        title: "Arquitectura sistémica de la IA educativa",
        description:
          "Relaciona infraestructura, evolución histórica, funcionamiento de los modelos y ciclo de aprendizaje activo.",
        alt: "Infografía de la arquitectura sistémica de la inteligencia artificial educativa",
        width: 2752,
        height: 1536,
      },
      {
        id: "mapa-sistemico-ia-educativa",
        kind: "Mapa sistémico",
        src: "/course-assets/modules/module-01/visuals/mapa-sistemico-ia-educativa.png",
        title: "Fundamentos y evolución de la IA educativa",
        description:
          "Sintetiza taxonomía, línea de tiempo, capas técnicas, verificación humano-IA y aprendizaje activo.",
        alt: "Mapa sistémico de fundamentos y evolución de la inteligencia artificial educativa",
        width: 2752,
        height: 1536,
      },
      {
        id: "mapa-mental-introduccion-historica",
        kind: "Mapa mental",
        src: "/course-assets/modules/module-01/visuals/mapa-mental-introduccion-historica-ia.png",
        title: "Mapa mental de introducción histórica a la IA",
        description:
          "Organiza objetivos, definiciones, hitos, infraestructura, alfabetización crítica y usos de NotebookLM.",
        alt: "Mapa mental de introducción histórica a la inteligencia artificial",
        width: 2752,
        height: 1536,
      },
    ],
    documents: [
      {
        id: "presentation",
        kind: "Presentación",
        src: "/course-assets/modules/module-01/documents/critical-ai-architecture.pdf",
        title: "Critical AI Architecture",
        description:
          "Presentación visual para recorrer la arquitectura crítica de la IA y los fundamentos históricos del módulo.",
        pages: 10,
      },
      {
        id: "study-guide",
        kind: "Guía de estudio",
        src: "/course-assets/modules/module-01/documents/guia-estudio-introduccion-historica-ia.pdf",
        title: "Guía de estudio: Introducción histórica a la IA educativa",
        description:
          "Resumen del módulo con cuestionario de repaso y respuestas basadas en las fuentes.",
        pages: 3,
      },
    ],
  },
  "modulo-2-ia-generativa-lenguaje-simple": {
    moduleSlug: "modulo-2-ia-generativa-lenguaje-simple",
    eyebrow: "Recursos NotebookLM · Módulo 2",
    title: "Comprende cómo genera respuestas la IA",
    introduction:
      "Material multimedia creado desde las fuentes del módulo para estudiar tokens, contexto, predicción, alucinaciones y verificación con criterio humano.",
    media: {
      video: {
        src: "/course-assets/modules/module-02/media/ia-en-el-aula.mp4",
        title: "IA en el aula",
        description:
          "Video explicativo sobre el uso educativo de la IA generativa, su funcionamiento básico y el papel del docente o estudiante al verificar resultados.",
        duration: "7:54",
        type: "video/mp4",
        poster: "/course-assets/modules/module-02/visuals/arquitectura-ia-generativa.png",
      },
      audio: {
        src: "/course-assets/modules/module-02/media/evaluar-aprendizaje-real-con-ia.m4a",
        title: "Cómo evaluar el aprendizaje real con IA",
        description:
          "Audio de profundización sobre evaluación, evidencias de comprensión y uso crítico de respuestas generadas por IA.",
        duration: "20:25",
        type: "audio/mp4",
      },
    },
    visuals: [
      {
        id: "arquitectura-ia-generativa",
        kind: "Infografía",
        src: "/course-assets/modules/module-02/visuals/arquitectura-ia-generativa.png",
        title: "Arquitectura de la IA generativa",
        description:
          "Explica el recorrido desde datos y patrones hasta predicción probabilística, respuesta revisable y riesgo de alucinación.",
        alt: "Infografía sobre arquitectura de la inteligencia artificial generativa del patrón a la verificación",
        width: 2752,
        height: 1536,
      },
      {
        id: "arquitectura-sistemica-ia-generativa",
        kind: "Mapa sistémico",
        src: "/course-assets/modules/module-02/visuals/arquitectura-sistemica-ia-generativa.png",
        title: "Funcionamiento y criterio educativo",
        description:
          "Ordena fundamentos, flujo de procesamiento, mecánica de generación de texto, riesgos y triángulo de confiabilidad educativa.",
        alt: "Mapa sistémico de funcionamiento y criterio educativo de la inteligencia artificial generativa",
        width: 2752,
        height: 1536,
      },
      {
        id: "mapa-mental-ia-generativa",
        kind: "Mapa mental",
        src: "/course-assets/modules/module-02/visuals/mapa-mental-ia-generativa-lenguaje-simple.png",
        title: "Mapa mental de IA generativa en lenguaje simple",
        description:
          "Resume conceptos fundamentales, entrenamiento, predicción, atención, alucinaciones, NotebookLM y criterios de verificación.",
        alt: "Mapa mental de inteligencia artificial generativa en lenguaje simple",
        width: 2752,
        height: 1536,
      },
    ],
    documents: [
      {
        id: "presentation",
        kind: "Presentación",
        src: "/course-assets/modules/module-02/documents/generative-ai-blueprint.pdf",
        title: "Generative AI Blueprint",
        description:
          "Presentación visual para recorrer la arquitectura de la IA generativa, sus capas de procesamiento y su aplicación educativa.",
        pages: 14,
      },
      {
        id: "study-guide",
        kind: "Guía de estudio",
        src: "/course-assets/modules/module-02/documents/guia-estudio-ia-generativa-lenguaje-simple.pdf",
        title: "Guía de estudio: funcionamiento de la IA generativa",
        description:
          "Guía de repaso con síntesis del módulo, preguntas de estudio y respuestas basadas en las fuentes.",
        pages: 3,
      },
    ],
  },
  "modulo-3-infraestructura-datos-computacion": {
    moduleSlug: "modulo-3-infraestructura-datos-computacion",
    eyebrow: "Recursos NotebookLM · Módulo 3",
    title: "Visualiza la infraestructura invisible de la IA",
    introduction:
      "Material multimedia creado desde las fuentes del módulo para comprender internet, datos, nube, cómputo, modelos, fuentes y riesgos de infraestructura en el aprendizaje con IA.",
    media: {
      video: {
        src: "/course-assets/modules/module-03/media/infraestructura-de-la-ia.mp4",
        title: "Infraestructura de la IA",
        description:
          "Video explicativo sobre las capas técnicas que hacen posible la IA: datos, servidores, modelos, redes, nube y aplicaciones educativas.",
        duration: "8:07",
        type: "video/mp4",
        poster: "/course-assets/modules/module-03/visuals/anatomia-del-sistema-de-ia.png",
      },
      audio: {
        src: "/course-assets/modules/module-03/media/infraestructura-fisica-tras-la-ia.m4a",
        title: "La infraestructura física tras la inteligencia artificial",
        description:
          "Audio de profundización sobre servidores, GPU, energía, conexión, almacenamiento y el costo invisible detrás de cada interacción con IA.",
        duration: "18:55",
        type: "audio/mp4",
      },
    },
    visuals: [
      {
        id: "anatomia-sistema-ia",
        kind: "Infografía",
        src: "/course-assets/modules/module-03/visuals/anatomia-del-sistema-de-ia.png",
        title: "Anatomía del sistema de IA",
        description:
          "Descompone la IA educativa en capas de aplicación, lógica, datos, infraestructura física y base crítica de riesgos.",
        alt: "Infografía sobre la anatomía del sistema de inteligencia artificial y sus capas de infraestructura",
        width: 2752,
        height: 1536,
      },
      {
        id: "infraestructura-invisible-ia-educativa",
        kind: "Mapa sistémico",
        src: "/course-assets/modules/module-03/visuals/infraestructura-invisible-ia-educativa.png",
        title: "La infraestructura invisible de la IA educativa",
        description:
          "Conecta base física, datos, modelos, internet, NotebookLM, calidad de fuentes y criterio pedagógico.",
        alt: "Mapa sistémico de la infraestructura invisible de la inteligencia artificial educativa",
        width: 2752,
        height: 1536,
      },
      {
        id: "mapa-mental-infraestructura-ia",
        kind: "Mapa mental",
        src: "/course-assets/modules/module-03/visuals/mapa-mental-infraestructura-ia.png",
        title: "Mapa mental de infraestructura de IA",
        description:
          "Resume capas del sistema, infraestructura técnica, datos y fuentes, rol humano, NotebookLM en educación y riesgos.",
        alt: "Mapa mental sobre infraestructura, datos y computación detrás de la inteligencia artificial",
        width: 2752,
        height: 1536,
      },
    ],
    documents: [
      {
        id: "presentation",
        kind: "Presentación",
        src: "/course-assets/modules/module-03/documents/stratified-ai-architecture.pdf",
        title: "Stratified AI Architecture",
        description:
          "Presentación visual para estudiar la arquitectura estratificada de la IA y sus capas de infraestructura, datos y aplicación.",
        pages: 13,
      },
      {
        id: "study-guide",
        kind: "Guía de estudio",
        src: "/course-assets/modules/module-03/documents/guia-estudio-infraestructura-ia.pdf",
        title: "Guía de estudio: infraestructura de la inteligencia artificial",
        description:
          "Guía de repaso sobre internet, datos, computación, fuentes, nube, servidores y criterio crítico en el uso educativo de IA.",
        pages: 3,
      },
    ],
  },
  "modulo-4-uso-responsable-etico-critico": {
    moduleSlug: "modulo-4-uso-responsable-etico-critico",
    eyebrow: "Recursos NotebookLM · Módulo 4",
    title: "Aplica criterio ético, responsable y verificable",
    introduction:
      "Material multimedia creado desde las fuentes del módulo para trabajar privacidad, veracidad, sesgos, plagio, criterio humano y producción académica responsable con IA.",
    media: {
      video: {
        src: "/course-assets/modules/module-04/media/etica-de-la-ia-educativa.mp4",
        title: "Ética de la IA educativa",
        description:
          "Video explicativo sobre el uso responsable de la IA en educación, el criterio humano, la verificación y los límites éticos del aprendizaje asistido.",
        duration: "7:15",
        type: "video/mp4",
        poster: "/course-assets/modules/module-04/visuals/arquitectura-ia-responsable-educacion.png",
      },
      audio: {
        src: "/course-assets/modules/module-04/media/ia-critica-practica-universidad.m4a",
        title: "IA crítica y práctica en la universidad",
        description:
          "Audio de profundización sobre uso crítico, producción propia, integridad académica, riesgos y buenas prácticas universitarias con IA.",
        duration: "15:00",
        type: "audio/mp4",
      },
    },
    visuals: [
      {
        id: "arquitectura-ia-responsable-educacion",
        kind: "Infografía",
        src: "/course-assets/modules/module-04/visuals/arquitectura-ia-responsable-educacion.png",
        title: "Arquitectura del uso responsable de la IA en educación",
        description:
          "Organiza criterio humano, riesgos, ciclo de verificación, fuentes propias, producción verificable y semáforo pedagógico.",
        alt: "Infografía sobre arquitectura del uso responsable de la inteligencia artificial en educación",
        width: 2752,
        height: 1536,
      },
      {
        id: "marco-etico-ia-educativa",
        kind: "Mapa sistémico",
        src: "/course-assets/modules/module-04/visuals/marco-etico-ia-educativa.png",
        title: "Marco ético y crítico para la IA en educación",
        description:
          "Relaciona criterio humano, brújula ética, gestión de riesgos, semáforo de decisión y ciclo de aplicación con NotebookLM.",
        alt: "Mapa sistémico de criterio humano y marco ético crítico para inteligencia artificial en educación",
        width: 2752,
        height: 1536,
      },
      {
        id: "mapa-mental-alfabetizacion-ia",
        kind: "Mapa mental",
        src: "/course-assets/modules/module-04/visuals/mapa-mental-alfabetizacion-ia.png",
        title: "Mapa mental de retos de alfabetización en IA",
        description:
          "Resume criterio humano, ética, verificación, buenas prácticas, riesgos, ventajas pedagógicas y acompañamiento docente.",
        alt: "Mapa mental sobre retos de alfabetización en inteligencia artificial, ética y uso responsable",
        width: 2752,
        height: 1536,
      },
    ],
    documents: [
      {
        id: "presentation",
        kind: "Presentación",
        src: "/course-assets/modules/module-04/documents/ia-academica-responsable.pdf",
        title: "IA Académica Responsable",
        description:
          "Presentación visual para estudiar el uso académico responsable de la IA, sus riesgos, límites y criterios de aplicación.",
        pages: 12,
      },
      {
        id: "study-guide",
        kind: "Guía de estudio",
        src: "/course-assets/modules/module-04/documents/guia-estudio-uso-responsable-etico-critico-ia.pdf",
        title: "Guía de estudio: uso responsable, ético y crítico de la IA",
        description:
          "Guía de repaso con síntesis del módulo, preguntas de estudio y respuestas sobre privacidad, veracidad, transparencia y justicia.",
        pages: 3,
      },
    ],
  },
  "modulo-5-herramientas-ia-educacion": {
    moduleSlug: "modulo-5-herramientas-ia-educacion",
    eyebrow: "Recursos NotebookLM · Módulo 5",
    title: "Elige herramientas de IA con criterio pedagógico",
    introduction:
      "Material multimedia creado desde las fuentes del módulo para seleccionar herramientas según tarea, fuentes, búsqueda, producción, rol educativo y evidencia verificable.",
    media: {
      video: {
        src: "/course-assets/modules/module-05/media/ia-estrategica-estudiantes.mp4",
        title: "IA estratégica para estudiantes",
        description:
          "Video explicativo sobre cómo elegir y usar herramientas de IA en el aprendizaje sin perder propósito, criterio ni verificación.",
        duration: "6:13",
        type: "video/mp4",
        poster: "/course-assets/modules/module-05/visuals/ecosistema-herramientas-ia-educacion.png",
      },
      audio: {
        src: "/course-assets/modules/module-05/media/criterio-pedagogico-frente-marcas-ia.m4a",
        title: "Criterio pedagógico frente a marcas de IA",
        description:
          "Audio de profundización sobre selección de herramientas por función, no por moda: NotebookLM, buscadores, asistentes conversacionales y producción visual.",
        duration: "14:00",
        type: "audio/mp4",
      },
    },
    visuals: [
      {
        id: "ecosistema-herramientas-ia-educacion",
        kind: "Infografía",
        src: "/course-assets/modules/module-05/visuals/ecosistema-herramientas-ia-educacion.png",
        title: "Ecosistema de herramientas de IA para educación",
        description:
          "Ordena criterio pedagógico, pregunta profesional, secuencia de decisión, NotebookLM, familias de herramientas y flujo didáctico.",
        alt: "Infografía del ecosistema de herramientas de inteligencia artificial para educación",
        width: 1376,
        height: 768,
      },
      {
        id: "principales-herramientas-ia-educacion",
        kind: "Mapa sistémico",
        src: "/course-assets/modules/module-05/visuals/principales-herramientas-ia-educacion.png",
        title: "Principales herramientas de IA para educación",
        description:
          "Presenta familias de herramientas, criterios de selección, flujo de trabajo didáctico, uso por rol y fundamentos permanentes.",
        alt: "Mapa sistémico de principales herramientas de inteligencia artificial para educación",
        width: 1376,
        height: 768,
      },
      {
        id: "mapa-mental-elegir-herramientas-criterio",
        kind: "Mapa mental",
        src: "/course-assets/modules/module-05/visuals/mapa-mental-elegir-herramientas-criterio.png",
        title: "Mapa mental para elegir herramientas con criterio",
        description:
          "Resume cultura de selección, NotebookLM como eje central, familias de herramientas, uso por rol, evaluación y cierre.",
        alt: "Mapa mental para elegir herramientas de inteligencia artificial con criterio educativo",
        width: 1376,
        height: 768,
      },
    ],
    documents: [
      {
        id: "presentation",
        kind: "Presentación",
        src: "/course-assets/modules/module-05/documents/pedagogical-ai-blueprint.pdf",
        title: "Pedagogical AI Blueprint",
        description:
          "Presentación visual para estudiar el ecosistema de herramientas de IA educativa y su selección según objetivos pedagógicos.",
        pages: 14,
      },
      {
        id: "study-guide",
        kind: "Guía de estudio",
        src: "/course-assets/modules/module-05/documents/guia-estudio-herramientas-ia-educacion-notebooklm.pdf",
        title: "Guía de estudio: herramientas de IA para la educación y NotebookLM",
        description:
          "Guía de repaso sobre familias de herramientas, NotebookLM, asistentes conversacionales, buscadores, producción visual y uso por rol.",
        pages: 4,
      },
    ],
  },
  "modulo-6-notebooklm-desde-cero": {
    moduleSlug: "modulo-6-notebooklm-desde-cero",
    eyebrow: "Recursos NotebookLM · Módulo 6",
    title: "Construye un método de estudio con fuentes propias",
    introduction:
      "Material multimedia creado desde las fuentes del módulo para aprender a crear notebooks, cargar fuentes, formular preguntas, verificar respuestas, guardar notas y producir evidencias educativas.",
    media: {
      video: {
        src: "/course-assets/modules/module-06/media/estudio-con-notebooklm.mp4",
        title: "Estudio con NotebookLM",
        description:
          "Video explicativo sobre el uso de NotebookLM como sistema de estudio basado en fuentes, preguntas, verificación y producción.",
        duration: "7:27",
        type: "video/mp4",
        poster: "/course-assets/modules/module-06/visuals/notebooklm-metodo-trabajo-fuentes.png",
      },
      audio: {
        src: "/course-assets/modules/module-06/media/preparar-examenes-con-ia.m4a",
        title: "Cómo preparar exámenes con IA",
        description:
          "Audio de profundización sobre preparación de exámenes con IA, recuperación activa, preguntas, síntesis y comprensión verificable.",
        duration: "10:17",
        type: "audio/mp4",
      },
    },
    visuals: [
      {
        id: "notebooklm-metodo-trabajo-fuentes",
        kind: "Infografía",
        src: "/course-assets/modules/module-06/visuals/notebooklm-metodo-trabajo-fuentes.png",
        title: "NotebookLM: método de trabajo con fuentes",
        description:
          "Ordena insumos, criterios de selección, objetivo, carga de fuentes, verificación, preguntas, notas y productos educativos.",
        alt: "Infografía de NotebookLM como método de trabajo con fuentes propias",
        width: 1376,
        height: 768,
      },
      {
        id: "notebooklm-sistema-trabajo-fuentes",
        kind: "Mapa sistémico",
        src: "/course-assets/modules/module-06/visuals/notebooklm-sistema-trabajo-fuentes.png",
        title: "El sistema NotebookLM",
        description:
          "Relaciona entradas y criterios, proceso cíclico, gestión de riesgos, funciones principales y salidas aplicadas.",
        alt: "Mapa sistémico del sistema NotebookLM como método de trabajo con fuentes",
        width: 1376,
        height: 768,
      },
      {
        id: "mapa-mental-notebooklm-educacion",
        kind: "Mapa mental",
        src: "/course-assets/modules/module-06/visuals/mapa-mental-notebooklm-educacion.png",
        title: "Mapa mental de NotebookLM en educación",
        description:
          "Resume conceptos fundamentales, carga de fuentes, criterios de calidad, funciones, productos, usos educativos, prompts y seguridad.",
        alt: "Mapa mental sobre NotebookLM en educación y sus funciones de aprendizaje",
        width: 1376,
        height: 768,
      },
    ],
    documents: [
      {
        id: "presentation",
        kind: "Presentación",
        src: "/course-assets/modules/module-06/documents/notebooklm-cognitive-architecture.pdf",
        title: "NotebookLM Cognitive Architecture",
        description:
          "Presentación visual para estudiar NotebookLM como arquitectura cognitiva de lectura aumentada, fuentes propias y producción educativa.",
        pages: 12,
      },
      {
        id: "study-guide",
        kind: "Guía de estudio",
        src: "/course-assets/modules/module-06/documents/guia-estudio-notebooklm-ambito-educativo-investigativo.pdf",
        title: "Guía de estudio: NotebookLM en el ámbito educativo e investigativo",
        description:
          "Guía de repaso sobre NotebookLM, carga de fuentes, prompts, verificación, funciones de estudio y aplicaciones para estudiantes y docentes.",
        pages: 3,
      },
    ],
  },
  "modulo-7-notebooklm-para-estudiantes": {
    moduleSlug: "modulo-7-notebooklm-para-estudiantes",
    eyebrow: "Recursos NotebookLM · Módulo 7",
    title: "Aprende de forma activa, autónoma y verificable",
    introduction:
      "Material multimedia creado desde las fuentes del módulo para convertir NotebookLM en un sistema de estudio basado en organización, preguntas potentes, verificación de citas, recuperación activa y explicación propia.",
    media: {
      video: {
        src: "/course-assets/modules/module-07/media/aprender-con-notebooklm.mp4",
        title: "Aprender con NotebookLM",
        description:
          "Video explicativo sobre cómo transformar fuentes propias en un método de estudio activo para comprender, practicar, verificar y producir conocimiento.",
        duration: "8:06",
        type: "video/mp4",
        poster: "/course-assets/modules/module-07/visuals/metodologia-aprendizaje-activo-digital.png",
      },
      audio: {
        src: "/course-assets/modules/module-07/media/aprende-de-verdad-con-notebooklm.m4a",
        title: "Aprende de verdad con NotebookLM",
        description:
          "Audio de profundización sobre aprendizaje activo, recuperación, metacognición, preparación de exámenes y uso de la IA sin sustituir la comprensión.",
        duration: "24:00",
        type: "audio/mp4",
      },
    },
    visuals: [
      {
        id: "metodologia-aprendizaje-activo-digital",
        kind: "Infografía",
        src: "/course-assets/modules/module-07/visuals/metodologia-aprendizaje-activo-digital.png",
        title: "Sistema de aprendizaje activo con NotebookLM",
        description:
          "Representa la organización de fuentes, el método de estudio inteligente, las técnicas cognitivas y los productos de aprendizaje verificable.",
        alt: "Infografía del sistema de aprendizaje activo con NotebookLM como metodología de estudio",
        width: 2752,
        height: 1536,
      },
      {
        id: "metodologia-aprendizaje-activo-sistemico",
        kind: "Mapa sistémico",
        src: "/course-assets/modules/module-07/visuals/metodologia-aprendizaje-activo-sistemico.png",
        title: "Metodología sistémica de aprendizaje activo",
        description:
          "Organiza el control de calidad de fuentes, el núcleo de comprensión verificable, las consignas, el proceso lineal y los productos de estudio.",
        alt: "Mapa sistémico de la metodología de aprendizaje activo y verificable con NotebookLM",
        width: 2752,
        height: 1536,
      },
      {
        id: "mapa-mental-metodologia-educacion",
        kind: "Mapa mental",
        src: "/course-assets/modules/module-07/visuals/mapa-mental-metodologia-educacion.png",
        title: "Mapa mental de metodología para la educación",
        description:
          "Resume hábitos de estudio, organización de información, flujo de trabajo con fuentes, problemas de aprendizaje, exposición, síntesis y soluciones.",
        alt: "Mapa mental sobre metodología para la educación y aprendizaje autónomo con fuentes",
        width: 1376,
        height: 768,
      },
    ],
    documents: [
      {
        id: "presentation",
        kind: "Presentación",
        src: "/course-assets/modules/module-07/documents/notebooklm-cognitive-cartography.pdf",
        title: "NotebookLM Cognitive Cartography",
        description:
          "Presentación visual para estudiar NotebookLM como cartografía cognitiva aplicada a fuentes, preguntas, verificación y aprendizaje activo.",
        pages: 13,
      },
      {
        id: "study-guide",
        kind: "Guía de estudio",
        src: "/course-assets/modules/module-07/documents/guia-estudio-notebooklm-aprendizaje-activo.pdf",
        title: "Guía de estudio: NotebookLM para el aprendizaje activo",
        description:
          "Guía de repaso con conceptos fundamentales, cuestionario y respuestas sobre organización, preguntas, citas, recuperación activa y metacognición.",
        pages: 3,
      },
    ],
  },
  "modulo-8-notebooklm-para-docentes": {
    moduleSlug: "modulo-8-notebooklm-para-docentes",
    eyebrow: "Recursos NotebookLM · Módulo 8",
    title: "Diseña experiencias educativas con criterio docente",
    introduction:
      "Material multimedia creado desde las fuentes del módulo para planificar clases, seleccionar materiales legítimos, formular consignas, verificar resultados, adaptar propuestas y producir recursos educativos responsables con NotebookLM.",
    media: {
      video: {
        src: "/course-assets/modules/module-08/media/notebooklm-para-educadores.mp4",
        title: "NotebookLM para educadores",
        description:
          "Video explicativo sobre el uso de NotebookLM como asistente pedagógico para organizar fuentes, planificar clases, crear actividades y sostener el criterio profesional docente.",
        duration: "6:46",
        type: "video/mp4",
        poster: "/course-assets/modules/module-08/visuals/planificacion-docente-con-ia.png",
      },
      audio: {
        src: "/course-assets/modules/module-08/media/notebooklm-friccion-critica-docente.m4a",
        title: "NotebookLM y la fricción crítica docente",
        description:
          "Audio de profundización sobre la revisión humana, la verificación de fuentes, la adaptación contextual y la responsabilidad docente frente a las respuestas generadas por IA.",
        duration: "13:02",
        type: "audio/mp4",
      },
    },
    visuals: [
      {
        id: "planificacion-docente-con-ia",
        kind: "Infografía",
        src: "/course-assets/modules/module-08/visuals/planificacion-docente-con-ia.png",
        title: "Sistema de planificación docente con NotebookLM",
        description:
          "Representa el recorrido desde las fuentes de cátedra hasta el diseño didáctico, la adaptación, la evaluación y los productos educativos verificables.",
        alt: "Infografía del sistema de planificación docente con NotebookLM desde las fuentes hasta el aula",
        width: 2752,
        height: 1536,
      },
      {
        id: "mapa-sistemico-notebooklm-docentes",
        kind: "Mapa sistémico",
        src: "/course-assets/modules/module-08/visuals/mapa-sistemico-notebooklm-docentes.png",
        title: "NotebookLM en el ecosistema docente",
        description:
          "Organiza entradas, diseño didáctico, productos verificables, ciclos de retroalimentación y protocolos de privacidad y transparencia académica.",
        alt: "Mapa sistémico de NotebookLM en el ecosistema docente con el criterio profesional como eje central",
        width: 2752,
        height: 1536,
      },
      {
        id: "mapa-mental-uso-ia-etica-docente",
        kind: "Mapa mental",
        src: "/course-assets/modules/module-08/visuals/mapa-mental-uso-ia-etica-docente.png",
        title: "Mapa mental de uso ético de IA para docentes",
        description:
          "Resume formulación de tareas, modelos docentes, regulación de acceso, buenas prácticas, evaluación, integridad institucional y mejora continua.",
        alt: "Mapa mental sobre uso de inteligencia artificial, ética y buenas prácticas para docentes",
        width: 1376,
        height: 768,
      },
    ],
    documents: [
      {
        id: "presentation",
        kind: "Presentación",
        src: "/course-assets/modules/module-08/documents/notebooklm-pedagogical-architecture.pdf",
        title: "NotebookLM Pedagogical Architecture",
        description:
          "Presentación visual para estudiar la arquitectura pedagógica de NotebookLM, la secuencia docente con IA y la producción de materiales verificables.",
        pages: 11,
      },
      {
        id: "study-guide",
        kind: "Guía de estudio",
        src: "/course-assets/modules/module-08/documents/guia-estudio-notebooklm-docentes.pdf",
        title: "Guía de estudio: NotebookLM para docentes",
        description:
          "Guía de repaso con conceptos, preguntas y respuestas sobre planificación, fuentes, consignas, verificación, adaptación y responsabilidad docente.",
        pages: 3,
      },
    ],
  },
  "modulo-9-investigacion-academica-asistida": {
    moduleSlug: "modulo-9-investigacion-academica-asistida",
    eyebrow: "Recursos NotebookLM · Módulo 9",
    title: "Investiga con rigor, trazabilidad y producción propia",
    introduction:
      "Material multimedia creado desde las fuentes del módulo para delimitar problemas, seleccionar documentos académicos, comparar autores, construir matrices, elaborar síntesis críticas y verificar citas sin delegar el juicio del investigador.",
    media: {
      video: {
        src: "/course-assets/modules/module-09/media/investigacion-asistida-con-ia.mp4",
        title: "Investigación asistida con IA",
        description:
          "Video explicativo sobre el flujo de investigación académica con NotebookLM: pregunta delimitada, fuentes confiables, exploración, matriz de autores, síntesis crítica y verificación.",
        duration: "7:05",
        type: "video/mp4",
        poster: "/course-assets/modules/module-09/visuals/sistema-investigacion-academica-asistida-ia.png",
      },
      audio: {
        src: "/course-assets/modules/module-09/media/notebooklm-riesgo-aplanamiento-teorico.m4a",
        title: "NotebookLM y el riesgo del aplanamiento teórico",
        description:
          "Audio de profundización sobre el riesgo de homogeneizar perspectivas, perder matices entre autores o aceptar síntesis automáticas sin comparación, atribución ni revisión crítica.",
        duration: "14:08",
        type: "audio/mp4",
      },
    },
    visuals: [
      {
        id: "sistema-investigacion-academica-asistida-ia",
        kind: "Infografía",
        src: "/course-assets/modules/module-09/visuals/sistema-investigacion-academica-asistida-ia.png",
        title: "Sistema de investigación académica asistida con IA",
        description:
          "Organiza el proceso en cuatro capas: pregunta delimitada, calidad de fuentes, matriz de autores y producción verificable con control de citas.",
        alt: "Infografía del sistema de investigación académica asistida con IA desde la pregunta hasta la producción verificable",
        width: 2752,
        height: 1536,
      },
      {
        id: "flujo-sistemico-investigacion-notebooklm",
        kind: "Mapa sistémico",
        src: "/course-assets/modules/module-09/visuals/flujo-sistemico-investigacion-notebooklm.png",
        title: "Flujo sistémico de investigación con NotebookLM",
        description:
          "Representa seis fases de trabajo: delimitar, reunir, explorar, comparar, sintetizar y verificar, con la matriz de autores como núcleo del análisis.",
        alt: "Mapa sistémico del flujo de investigación académica con NotebookLM en seis fases",
        width: 2752,
        height: 1536,
      },
      {
        id: "mapa-mental-investigacion-academica-ia",
        kind: "Mapa mental",
        src: "/course-assets/modules/module-09/visuals/mapa-mental-investigacion-academica-ia.png",
        title: "Mapa mental de investigación académica asistida con IA",
        description:
          "Resume calidad de fuentes, organización del notebook, niveles de preguntas, matrices, síntesis crítica, evaluación y honestidad académica.",
        alt: "Mapa mental sobre investigación académica asistida con inteligencia artificial y NotebookLM",
        width: 1376,
        height: 768,
      },
    ],
    documents: [
      {
        id: "presentation",
        kind: "Presentación",
        src: "/course-assets/modules/module-09/documents/rigorous-ai-research.pdf",
        title: "Rigorous AI Research",
        description:
          "Presentación visual para estudiar la arquitectura de una investigación rigurosa asistida por IA, desde la selección de fuentes hasta la síntesis y verificación.",
        pages: 13,
      },
      {
        id: "study-guide",
        kind: "Guía de estudio",
        src: "/course-assets/modules/module-09/documents/guia-estudio-investigacion-academica-ia.pdf",
        title: "Guía de estudio: investigación académica asistida con IA",
        description:
          "Guía de repaso con preguntas, respuestas y propuestas de ensayo sobre fuentes, matriz de autores, síntesis crítica, trazabilidad y honestidad académica.",
        pages: 3,
      },
    ],
  },
  "modulo-10-proyecto-final-aplicado": {
    moduleSlug: "modulo-10-proyecto-final-aplicado",
    eyebrow: "Recursos NotebookLM · Módulo 10",
    title: "Convierte el aprendizaje en una evidencia defendible",
    introduction:
      "Material multimedia creado desde las fuentes del módulo para definir un problema real, seleccionar documentos pertinentes, construir un notebook funcional, verificar resultados, producir un recurso propio y defender las decisiones tomadas.",
    media: {
      video: {
        src: "/course-assets/modules/module-10/media/cuaderno-inteligente-con-ia.mp4",
        title: "Cuaderno inteligente con IA",
        description:
          "Video explicativo sobre la construcción de un proyecto final con NotebookLM que integra fuentes, preguntas, verificación, producto reutilizable y evidencia del proceso humano.",
        duration: "6:51",
        type: "video/mp4",
        poster: "/course-assets/modules/module-10/visuals/arquitectura-sistemica-proyecto-final.png",
      },
      audio: {
        src: "/course-assets/modules/module-10/media/aprendizaje-real-o-ilusion-de-fluidez.m4a",
        title: "Aprendizaje real o ilusión de fluidez",
        description:
          "Audio de profundización sobre la diferencia entre una producción comprendida y defendible y una respuesta de IA que solo parece clara, completa o profesional.",
        duration: "19:26",
        type: "audio/mp4",
      },
    },
    visuals: [
      {
        id: "arquitectura-sistemica-proyecto-final",
        kind: "Infografía",
        src: "/course-assets/modules/module-10/visuals/arquitectura-sistemica-proyecto-final.png",
        title: "Arquitectura sistémica para el proyecto final",
        description:
          "Presenta la ruta de integración desde la definición del problema hasta la defensa, junto con perfiles de aplicación, criterios de calidad y un taller operativo.",
        alt: "Infografía de la arquitectura sistémica para proyectos finales con IA y NotebookLM",
        width: 2752,
        height: 1536,
      },
      {
        id: "arquitectura-proyecto-final-ia",
        kind: "Mapa sistémico",
        src: "/course-assets/modules/module-10/visuals/arquitectura-proyecto-final-ia.png",
        title: "Arquitectura del proyecto final con IA y NotebookLM",
        description:
          "Organiza fundamentos, proceso, perfiles de producto y defensa final para transformar el aprendizaje en una evidencia profesional verificable.",
        alt: "Mapa sistémico de la arquitectura del proyecto final con IA y NotebookLM",
        width: 2752,
        height: 1536,
      },
      {
        id: "mapa-mental-proyecto-final-notebooklm",
        kind: "Mapa mental",
        src: "/course-assets/modules/module-10/visuals/mapa-mental-proyecto-final-notebooklm.png",
        title: "Mapa mental del proyecto final con NotebookLM",
        description:
          "Resume metodología, ciclo de trabajo, fuentes, roles, flexibilidad por perfil, límites, riesgos y validación docente del proyecto.",
        alt: "Mapa mental sobre metodología, fuentes, roles y riesgos de un proyecto final con NotebookLM",
        width: 1376,
        height: 768,
      },
    ],
    documents: [
      {
        id: "presentation",
        kind: "Presentación",
        src: "/course-assets/modules/module-10/documents/cognitive-ai-architecture.pdf",
        title: "Cognitive AI Architecture",
        description:
          "Presentación visual para estudiar la arquitectura cognitiva y metodológica de un proyecto aplicado con IA, fuentes, verificación y autoría humana.",
        pages: 13,
      },
      {
        id: "study-guide",
        kind: "Guía de estudio",
        src: "/course-assets/modules/module-10/documents/guia-estudio-proyecto-final-ia-notebooklm.pdf",
        title: "Guía de estudio: proyecto final aplicado con IA y NotebookLM",
        description:
          "Guía de repaso con preguntas, respuestas, ensayos y glosario sobre ruta de integración, pensamiento crítico, rúbrica, defensa y transferencia institucional.",
        pages: 3,
      },
    ],
  },
  "modulo-11-actualizacion-permanente": {
    moduleSlug: "modulo-11-actualizacion-permanente",
    eyebrow: "Recursos NotebookLM · Módulo 11",
    title: "Aprende a actualizarte sin perseguir cada novedad",
    introduction:
      "Material multimedia creado desde las fuentes del módulo para distinguir fundamentos de herramientas, evaluar novedades con criterio, probar cambios en casos reales y sostener una rutina profesional de aprendizaje continuo.",
    media: {
      video: {
        src: "/course-assets/modules/module-11/media/actualizacion-permanente-ia.mp4",
        title: "Actualización permanente en inteligencia artificial",
        description:
          "Video explicativo sobre cómo pasar de usuario de herramientas a aprendiz estratégico mediante fundamentos, observación, prueba, verificación, integración y enseñanza.",
        duration: "11:27",
        type: "video/mp4",
        poster: "/course-assets/modules/module-11/visuals/sistema-actualizacion-ia.png",
      },
      audio: {
        src: "/course-assets/modules/module-11/media/ia-para-sobrevivir-a-primero.m4a",
        title: "IA para sobrevivir a primero",
        description:
          "Audio de profundización sobre adaptación académica, aprendizaje real y uso estratégico de IA para afrontar nuevas exigencias sin reemplazar fundamentos ni esfuerzo intelectual.",
        duration: "11:41",
        type: "audio/mp4",
      },
    },
    visuals: [
      {
        id: "sistema-actualizacion-ia",
        kind: "Infografía",
        src: "/course-assets/modules/module-11/visuals/sistema-actualizacion-ia.png",
        title: "Sistema de actualización en IA",
        description:
          "Distingue fundamentos permanentes, métodos flexibles y herramientas cambiantes, e integra una brújula profesional, la regla 70-20-10 y filtros de adopción.",
        alt: "Infografía del sistema de actualización en inteligencia artificial desde las herramientas hasta los fundamentos",
        width: 2752,
        height: 1536,
      },
      {
        id: "ecosistema-actualizacion-permanente-ia",
        kind: "Mapa sistémico",
        src: "/course-assets/modules/module-11/visuals/ecosistema-actualizacion-permanente-ia.png",
        title: "Ecosistema de actualización permanente en IA",
        description:
          "Organiza niveles de estabilidad, ciclo continuo, criterio pedagógico y un plan de 30, 60 y 90 días para consolidar, comparar y transferir aprendizajes.",
        alt: "Mapa sistémico del ecosistema de actualización permanente en IA con mentalidad y fundamentos",
        width: 2752,
        height: 1536,
      },
      {
        id: "mapa-mental-actualizacion-permanente-ia",
        kind: "Mapa mental",
        src: "/course-assets/modules/module-11/visuals/mapa-mental-actualizacion-permanente-ia.png",
        title: "Mapa mental de actualización permanente y aprendizaje en IA",
        description:
          "Resume fundamentos, herramientas, brújula profesional, sobriedad tecnológica, competencias humanas, mantenimiento y ruta de actualización continua.",
        alt: "Mapa mental sobre actualización permanente, fundamentos, herramientas y aprendizaje continuo en IA",
        width: 2752,
        height: 1536,
      },
    ],
    documents: [
      {
        id: "presentation",
        kind: "Presentación",
        src: "/course-assets/modules/module-11/documents/cognitive-cartography.pdf",
        title: "Cognitive Cartography",
        description:
          "Presentación visual para estudiar la cartografía cognitiva de la actualización profesional, los fundamentos transferibles y la evaluación de nuevas herramientas.",
        pages: 14,
      },
      {
        id: "study-guide",
        kind: "Guía de estudio",
        src: "/course-assets/modules/module-11/documents/guia-estudio-actualizacion-permanente-ia.pdf",
        title: "Guía de estudio: actualización permanente y mentalidad de aprendizaje en IA",
        description:
          "Guía de repaso con preguntas, respuestas, ensayos y glosario sobre fundamentos, brújula de actualización, sobriedad tecnológica y aprendizaje estratégico.",
        pages: 3,
      },
    ],
  },
};

export function getModuleResourceBundle(moduleSlug: string) {
  return moduleResourceBundles[moduleSlug] ?? null;
}
