# Autenticación y progreso híbrido Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Incorporar cuentas opcionales y sincronización del aprendizaje sin cerrar el acceso público.

**Architecture:** Supabase Auth mantiene sesiones SSR mediante cookies. Un almacén local versionado conserva el aprendizaje visitante y un importador autenticado realiza `upsert` en tablas protegidas por RLS.

**Tech Stack:** Next.js 15 App Router, React 19, Supabase Auth/PostgreSQL, `@supabase/ssr`, Vitest.

---

### Task 1: Sesión SSR pública

**Files:**
- Create: `src/lib/supabase/middleware.ts`
- Create: `middleware.ts`
- Create: `src/lib/auth/session.ts`
- Test: `src/lib/auth/session.test.ts`

- [ ] Definir y probar la presentación de usuario autenticado y visitante.
- [ ] Implementar actualización de cookies sin proteger rutas del curso.
- [ ] Verificar el test enfocado.

### Task 2: Registro, login y recuperación

**Files:**
- Create: `src/lib/auth/actions.ts`
- Create: `src/app/auth/login/page.tsx`
- Create: `src/app/auth/register/page.tsx`
- Create: `src/app/auth/forgot-password/page.tsx`
- Create: `src/app/auth/update-password/page.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/components/auth/auth-form.tsx`
- Test: `src/lib/auth/validation.test.ts`

- [ ] Escribir primero pruebas de validación.
- [ ] Implementar acciones y pantallas con mensajes en español.
- [ ] Verificar redirecciones y errores.

### Task 3: Estado visitante versionado

**Files:**
- Create: `src/lib/learning/local-learning-state.ts`
- Create: `src/lib/learning/local-learning-state.test.ts`
- Modify: `src/components/module-learning-boxes.tsx`
- Modify: `src/components/module-exam.tsx`
- Modify: `src/app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx`

- [ ] Probar serialización, normalización y combinación del estado local.
- [ ] Guardar progreso y exámenes anónimos en el navegador.
- [ ] Mantener notas y actividades existentes dentro del paquete importable.

### Task 4: Importación a Supabase

**Files:**
- Create: `src/lib/learning/import-actions.ts`
- Create: `src/components/auth/import-progress-card.tsx`
- Create: `src/app/account/page.tsx`
- Test: `src/lib/learning/import-payload.test.ts`

- [ ] Validar el payload en una prueba fallida.
- [ ] Resolver slugs publicados y hacer `upsert` con el usuario verificado.
- [ ] Mostrar resumen de importación y permitir conservar o limpiar lo local.

### Task 5: Cabecera y verificación integral

**Files:**
- Modify: `src/components/app-shell.tsx`
- Modify: `README.md`

- [ ] Sustituir el perfil fijo por sesión real.
- [ ] Ejecutar tests, lint y build.
- [ ] Probar en navegador como visitante y usuario.
- [ ] Commit y push a `main`.
