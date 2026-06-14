# Optimización de Entrega de Contenido Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reducir las descargas iniciales de imágenes, PDF, audio y video sin modificar el contenido.

**Architecture:** Los originales permanecen disponibles y se generan derivados versionados para visualización. Los recursos pesados se montan únicamente después de una acción explícita y Supabase aplica caché larga a las rutas versionadas.

**Tech Stack:** Next.js 15, React 19, Vitest, Testing Library, Sharp, pdf-lib, pdf-parse y Supabase Storage.

---

### Task 1: Visores diferidos

**Files:**
- Create: `src/components/deferred-media.tsx`
- Create: `src/components/deferred-media.test.tsx`
- Modify: `src/components/module-resource-library.tsx`
- Modify: `src/components/module-source-document.tsx`
- Modify: `src/components/program-media-section.tsx`
- Modify: `src/components/program-visual-library.tsx`
- Modify: `src/app/program/page.tsx`

- [ ] Escribir pruebas que confirmen que `iframe`, `audio` y `video` no existen antes del clic.
- [ ] Ejecutar las pruebas y confirmar el fallo por ausencia de los componentes diferidos.
- [ ] Implementar controles accesibles que monten el recurso al pulsar.
- [ ] Ejecutar las pruebas y confirmar que pasan.

### Task 2: Derivados de imágenes

**Files:**
- Create: `scripts/optimize-course-assets.mjs`
- Create: `src/lib/course-assets.ts`
- Create: `src/lib/course-assets.test.ts`
- Modify: componentes que renderizan imágenes del curso.

- [ ] Escribir pruebas para convertir rutas visuales a `v2/*.webp` manteniendo la ruta original de descarga.
- [ ] Confirmar el fallo inicial.
- [ ] Implementar el resolvedor y generar WebP con Sharp.
- [ ] Verificar dimensiones y reducción de bytes.

### Task 3: PDF conservador

**Files:**
- Modify: `scripts/optimize-course-assets.mjs`

- [ ] Generar copias con object streams mediante pdf-lib.
- [ ] Comparar cantidad de páginas y texto extraído con pdf-parse.
- [ ] Aceptar solo copias menores y equivalentes; conservar los demás originales.

### Task 4: Storage, caché y publicación

**Files:**
- Modify: `next.config.ts`

- [ ] Subir derivados a `course-assets/v2` sin sobrescribir originales.
- [ ] Configurar caché larga para rutas versionadas y retirar permisos temporales.
- [ ] Ejecutar pruebas, lint y build.
- [ ] Desplegar en Vercel y medir página, imagen, PDF y audio.
