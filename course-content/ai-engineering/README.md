# AI Engineering Aplicado — paquete para Codex

Este paquete contiene el Módulo 1 aprobado y listo para integrarse en una aplicación de curso.

## Objetivo

Usar la estructura tecnológica y pedagógica de `https://academia-ia-educativa.vercel.app/visual` como referencia funcional, sin copiarla de manera rígida. El nuevo curso tendrá identidad propia y estará orientado a AI Engineering, sistemas inteligentes y procesos productivos.

## Fuente de verdad

Los archivos incluidos son contenido aprobado. Codex debe integrarlos, no resumirlos ni reescribirlos automáticamente.

- `content/modulo-01/contenido-fundacional.html`: cuadernillo principal.
- `assets/images/modulo-01-infografia.png`: infografía definitiva.
- `assets/audio/modulo-01-audio-explicativo.mp3`: audio oficial.
- `cases/`: tres casos reales independientes.
- `assets/presentations/modulo-01-presentacion.pptx`: presentación educativa.
- `module-manifest.json`: metadatos y rutas.

## Proceso recomendado

1. Abrir el repositorio existente del curso Academia IA Educativa en Codex.
2. Crear una rama nueva: `feature/ai-engineering-course`.
3. Copiar este paquete dentro de `/course-content/ai-engineering/`.
4. Pedir a Codex que inspeccione primero la arquitectura actual sin modificar nada.
5. Solicitar un plan de integración por etapas.
6. Integrar únicamente el Módulo 1.
7. Revisar visualmente y corregir.
8. Cuando el módulo quede aprobado en la aplicación, crear la skill reutilizable para los módulos 2–12.

## Principios

- Separar contenido de interfaz.
- No incrustar textos extensos directamente en componentes cuando puedan cargarse desde archivos o datos.
- Mantener rutas de assets estables.
- No inventar contenido faltante.
- Conservar fuentes, títulos y jerarquía.
- Diseñar mobile-first y accesible.
- Requerir aprobación antes de cambios estructurales grandes.
