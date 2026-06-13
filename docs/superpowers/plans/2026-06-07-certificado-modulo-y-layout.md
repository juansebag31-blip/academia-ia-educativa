# Certificado de aprobación y layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Descargar un certificado interno de aprobación del Módulo 1 y eliminar el espacio vacío de la cuadrícula de aprendizaje.

**Architecture:** Una capa de dominio construirá metadata verificable a partir del módulo y del intento aprobado. Una ruta dinámica generará el PDF con `pdf-lib`; el componente de cierre solo habilitará la descarga cuando la aprobación esté confirmada. El layout se corrige compactando las flashcards dentro de su propia tarjeta.

**Tech Stack:** Next.js App Router, TypeScript, SQLite, pdf-lib, Tailwind CSS, Vitest.

---

### Task 1: Dominio del certificado

**Files:**
- Create: `src/lib/module-certificate.ts`
- Modify: `src/lib/course.test.ts`

- [ ] Escribir pruebas para elegibilidad, 6 horas, fecha e identificador.
- [ ] Ejecutar la prueba y confirmar que falla por no existir la implementación.
- [ ] Implementar la metadata del certificado.
- [ ] Ejecutar la prueba y confirmar que pasa.

### Task 2: Generación y descarga PDF

**Files:**
- Create: `src/lib/module-certificate-pdf.ts`
- Create: `src/app/api/certificates/modules/[moduleSlug]/route.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/lib/course.test.ts`

- [ ] Añadir una prueba que valide la cabecera `%PDF` del documento.
- [ ] Instalar `pdf-lib`.
- [ ] Implementar el PDF horizontal tecnológico.
- [ ] Implementar la ruta que responde 403 sin aprobación y PDF con aprobación.
- [ ] Ejecutar pruebas y TypeScript.

### Task 3: Interfaz del certificado

**Files:**
- Modify: `src/components/module-exam-callout.tsx`

- [ ] Mostrar el estado bloqueado cuando el examen no esté aprobado.
- [ ] Mostrar `Descargar certificado PDF` tras aprobar.
- [ ] Incluir 6 horas estimadas y la naturaleza interna del certificado.

### Task 4: Corrección del espacio vacío

**Files:**
- Modify: `src/components/active-learning-panel.tsx`

- [ ] Convertir las flashcards en una cuadrícula de dos columnas en escritorio.
- [ ] Reducir su altura mínima conservando legibilidad.
- [ ] Mantener una columna en móvil.

### Task 5: Verificación completa

- [ ] Ejecutar `npm.cmd test`.
- [ ] Ejecutar `npm.cmd run lint`.
- [ ] Ejecutar `npx.cmd tsc --noEmit`.
- [ ] Ejecutar `npm.cmd run build`.
- [ ] Verificar visualmente escritorio y móvil.
- [ ] Verificar respuestas HTTP del PDF fuente, examen y certificado bloqueado.
