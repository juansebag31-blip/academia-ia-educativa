# AGENTS.md

## Project Context

This repository is `academia-ia-educativa`, a free Spanish-language educational platform for learning artificial intelligence fundamentals, responsible tool use, and active learning with NotebookLM.

The app is built with Next.js 15, React 19, TypeScript, Tailwind CSS, Vitest, Supabase Auth/PostgreSQL integration, and Vercel-oriented deployment. The course must remain accessible without registration; accounts add synced progress, activities, exams, and certificates.

Use `C:\Users\juans\Projects\Curso de IA` as the real local project path. The old OneDrive path may contain placeholders or stale reparse points and should not be treated as the source of truth unless the user explicitly says otherwise.

## Main Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Production build: `npm run build`
- Lint: `npm run lint`
- Tests: `npm test`
- Watch tests: `npm run test:watch`
- Seed local data: `npm run db:seed`
- Import PDFs: `npm run content:import`
- Generate prompt kit PDF: `npm run kit:generate`

Before finishing code changes, run the narrowest relevant verification first. For broad app, routing, auth, marketing, or media changes, prefer:

```powershell
npm test
npm run lint
npm run build
```

If a command cannot be run because of missing environment values or local services, say exactly what blocked it.

## Repository Map

- `src/app/(marketing)/` - public landing, privacy, unsubscribe, and marketing pages.
- `src/app/(app)/` - course application shell, dashboard, modules, lessons, auth pages, account, calendar, reflection, and exams.
- `src/app/api/` - API routes for certificates and marketing downloads/unsubscribe.
- `src/components/` - shared UI, course modules, deferred media, auth, learning, and marketing components.
- `src/lib/` - course logic, exams, progress, Supabase clients, marketing, SEO, analytics, and asset helpers.
- `src/db/` - local database client and schema.
- `scripts/` - import, optimization, upload, seed, and generation utilities.
- `supabase/migrations/` - database schema and RLS migrations.
- `content/` - generated course/marketing source data.
- `docs/superpowers/specs/` and `docs/superpowers/plans/` - design decisions and implementation plans.
- `public/course-assets/` - original large course media, excluded from Git.
- `public/course-assets-optimized/` or Supabase Storage routes - optimized media delivery path.
- `output/pdf/` - generated prompt kit PDF included in the marketing kit API tracing.

## Product Rules

- Keep the course usable without login. Do not put lesson access, videos, PDFs, exams, or basic progress behind authentication unless the user explicitly asks.
- Registered accounts may sync progress through Supabase, but visitor progress must continue working through browser/local state.
- The primary audience is Spanish-speaking teachers, students, and beginner AI learners. UI copy should be clear, practical, and in Spanish.
- Maintain the current distinction between public marketing pages and the course app experience.
- Preserve SEO surfaces: `/sitemap.xml`, `/robots.txt`, metadata, canonical URL handling through `NEXT_PUBLIC_APP_URL`, and the Google verification file.
- Do not add marketing claims that guarantee search ranking, income, certification value, or outcomes.

## Media and Performance Rules

- Course media is large. Do not reintroduce eager loading of videos, audio, or PDF viewers.
- Preserve the deferred media pattern in `src/components/deferred-media.tsx`: media should load only after the user clicks.
- Preserve optimized asset routing through `src/lib/course-assets.ts` and `next.config.ts`.
- In production, `/course-assets-optimized/:path*` rewrites to Supabase Storage `course-assets/v2`.
- Do not commit generated large assets, local SQLite databases, `.env`, `.env.local`, or provider credentials.
- If changing media optimization scripts, verify paths for videos, PDFs, and images separately.

## Supabase and Secrets

- Public browser variables are `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_URL`, and `NEXT_PUBLIC_CONTACT_EMAIL`.
- Server-only values include `SUPABASE_SERVICE_ROLE_KEY`, `MARKETING_HASH_SECRET`, `MARKETING_DOWNLOAD_SECRET`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or any secret with a `NEXT_PUBLIC_` prefix.
- Check `.env.example` for the current variable list before adding or renaming environment variables.
- When touching Supabase migrations, preserve RLS assumptions and make migrations idempotent where practical.

## Marketing and Prompt Kit

- The public landing page offers access to the real course and a free prompt kit.
- Regenerate the kit with `npm run kit:generate`; the PDF should be produced at `output/pdf/kit-prompts-ia-educativa.pdf`.
- The kit is served through the API using signed access; do not publish the generated PDF directly under `public/`.
- Resend is optional. The download should still work on screen when email delivery is not configured.

## Code Style

- Follow the existing TypeScript, React, App Router, and Tailwind patterns.
- Prefer small, focused components over broad rewrites.
- Use existing helpers in `src/lib/` before creating new utility layers.
- Keep tests close to the changed logic and follow existing `*.test.ts` / `*.test.tsx` patterns.
- Use `lucide-react` icons when adding icon buttons or visual controls.
- Keep UI text fitting on mobile and desktop; avoid large decorative layouts for operational/course screens.
- Do not perform unrelated refactors while making a requested change.

## Workflow Expectations

- Inspect the current file and nearby tests before editing.
- Check `git status --short` before and after substantial changes.
- Treat existing uncommitted changes as user work unless clearly produced by the current task.
- Use `README.md`, `.env.example`, `package.json`, `next.config.ts`, and relevant files under `docs/superpowers/` as project references before guessing.
- For browser-facing changes, start the dev server when useful and verify the relevant page manually or with browser tooling.
- For deployment-related changes, consider Vercel, Supabase Storage rewrites, and environment variable requirements together.

## Done Criteria

For a typical code task, completion means:

- The requested behavior is implemented.
- Relevant tests, lint, or build checks were run, or blockers are reported.
- Large media and secrets remain out of Git.
- Free visitor access is preserved unless intentionally changed.
- The final response names the files changed and the verification performed.
