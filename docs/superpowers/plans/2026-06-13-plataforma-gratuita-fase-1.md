# Plataforma gratuita - Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preparar el repositorio y la infraestructura local de Supabase sin cambiar el acceso público actual al curso.

**Architecture:** Next.js continuará usando SQLite durante la transición. Se añadirá una configuración opcional de Supabase y una migración PostgreSQL con RLS, lista para aplicarse cuando exista el proyecto remoto específico.

**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase Auth/PostgreSQL, Vitest, GitHub.

---

### Task 1: Repositorio reproducible

**Files:**
- Modify: `.gitignore`
- Create: `.env.example`
- Create: `README.md`

- [ ] Excluir recursos generados, bases, secretos y cachés.
- [ ] Documentar instalación, comandos y transición a Supabase.
- [ ] Confirmar que ningún archivo mayor a 20 MB queda preparado para commit.

### Task 2: Contrato de configuración

**Files:**
- Create: `src/lib/supabase-config.test.ts`
- Create: `src/lib/supabase-config.ts`

- [ ] Escribir pruebas para configuración completa, incompleta y ausente.
- [ ] Ejecutar las pruebas y confirmar el fallo inicial.
- [ ] Implementar el validador mínimo.
- [ ] Confirmar que las pruebas pasan.

### Task 3: Clientes Supabase

**Files:**
- Modify: `package.json`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`

- [ ] Instalar `@supabase/supabase-js` y `@supabase/ssr`.
- [ ] Crear cliente de navegador y cliente de servidor.
- [ ] Evitar inicializarlos cuando falten variables durante la transición.

### Task 4: Esquema PostgreSQL y seguridad

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/<timestamp>_initial_learning_platform.sql`

- [ ] Inicializar el proyecto local con Supabase CLI.
- [ ] Crear tablas de catálogo y aprendizaje.
- [ ] Activar RLS en todas las tablas públicas.
- [ ] Crear políticas públicas para contenido publicado.
- [ ] Crear políticas privadas basadas en `auth.uid()`.
- [ ] Añadir índices y restricciones de unicidad.

### Task 5: GitHub y verificación

**Files:**
- Verify: complete repository

- [ ] Ejecutar pruebas, lint y build.
- [ ] Configurar identidad Git local con la cuenta GitHub autenticada.
- [ ] Crear el commit inicial.
- [ ] Crear un repositorio GitHub privado y subir la rama actual.
- [ ] Confirmar que bases, secretos y multimedia no están en GitHub.
