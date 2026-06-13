# Recursos multimedia del modulo 7

## Objetivo

Continuar el curso incorporando al modulo 7 la misma biblioteca de recursos usada por los modulos 5 y 6, sin modificar su portada, lecciones, actividades, examen ni PDF fuente.

## Estructura

El modulo 7 tendra un paquete `ModuleResourceBundle` con:

- Un video MP4 con duracion visible y descarga.
- Un audio M4A con duracion visible y descarga.
- Tres recursos visuales ampliables y descargables.
- Una presentacion PDF embebida y descargable.
- Una guia de estudio PDF embebida y descargable.

Los archivos viviran bajo `public/course-assets/modules/module-07/`, separados en `media`, `visuals` y `documents`, igual que los modulos anteriores.

## Correspondencia de archivos

- `Aprender_con_NotebookLM.mp4`: video del modulo, 8:06.
- `Aprende_de_verdad_con_NotebookLM.m4a`: audio de profundizacion, 24:00.
- `Metodología_de_Aprendizaje_Activo_Digital.png`: infografia, 2752 x 1536.
- `Metodología_de_Aprendizaje_Activo_Sistémico.png`: mapa sistemico, 2752 x 1536.
- `Gemini_Generated_Image_t5vfjjt5vfjjt5vf.png`: mapa mental, 1376 x 768.
- `NotebookLM_Cognitive_Cartography.pdf`: presentacion, 13 paginas.
- `Guía de Estudio_ NotebookLM para el Aprendizaje Activo.pdf`: guia de estudio, 3 paginas.

## Integracion y verificacion

Se agregara el bundle a `src/lib/module-resource-bundles.ts` y una prueba equivalente a las de los modulos 5 y 6 en `src/lib/course.test.ts`. La verificacion final incluira pruebas, lint, build y revision visual de la pagina real del modulo.
