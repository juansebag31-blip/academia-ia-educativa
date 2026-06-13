# Tema IA Cognitiva Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar la identidad visual IA Cognitiva a todo el curso sin modificar su contenido ni comportamiento.

**Architecture:** La identidad se centraliza en los tokens de Tailwind y CSS global. Los usos directos de naranja se sustituyen según función por azul, cian o violeta, mientras que los estados semánticos conservan sus colores.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Vitest.

---

### Task 1: Proteger la paleta con una prueba

**Files:**
- Create: `src/app/theme.test.ts`
- Test: `src/app/theme.test.ts`

- [ ] Escribir una prueba que lea `tailwind.config.ts` y `globals.css` y exija los cinco colores aprobados.
- [ ] Ejecutar `npm test -- src/app/theme.test.ts` y confirmar que falla porque la paleta aún no existe.

### Task 2: Actualizar tokens globales

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] Cambiar fondo, tinta, acción primaria, hover y foco a la paleta IA Cognitiva.
- [ ] Rehacer el hero con resplandores cian y violeta.
- [ ] Ejecutar la prueba de tema y confirmar que pasa.

### Task 3: Reasignar colores funcionales

**Files:**
- Modify: `src/app/**/*.tsx`
- Modify: `src/components/**/*.tsx`

- [ ] Sustituir fondos, bordes y textos naranjas de interacción por azules.
- [ ] Aplicar cian a detalles tecnológicos y violeta a énfasis cognitivos.
- [ ] Mantener verde, ámbar y rojo para estados semánticos.
- [ ] Confirmar que no quedan clases `orange-*` ni valores antiguos de marca.

### Task 4: Verificación integral

**Files:**
- Test: existing test suite

- [ ] Ejecutar `npm test`.
- [ ] Ejecutar `npm run lint`.
- [ ] Ejecutar `npm run build`.
- [ ] Revisar en navegador portada, módulo 1, módulo 11 y examen.
- [ ] Comprobar visualmente foco, hover, contraste y navegación responsive.
