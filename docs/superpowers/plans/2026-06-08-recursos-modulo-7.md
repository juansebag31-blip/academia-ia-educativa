# Module 7 Resources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the complete NotebookLM media and document library to module 7 using the exact structure established by modules 5 and 6.

**Architecture:** Reuse the existing `ModuleResourceBundle` data contract and `ModuleResourceLibrary` renderer. Add only static assets, one bundle entry, and one domain test; no new UI component or course behavior is required.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, static assets under `public`.

---

### Task 1: Define the expected module 7 bundle

**Files:**
- Modify: `src/lib/course.test.ts`

- [ ] Add a test for the module 7 media durations, three visual dimensions, PDF page counts, and presentation path.
- [ ] Run `npm test -- src/lib/course.test.ts` and confirm it fails because `getModuleResourceBundle("modulo-7-notebooklm-para-estudiantes")` returns `null`.

### Task 2: Install the supplied resources

**Files:**
- Create: `public/course-assets/modules/module-07/media/aprender-con-notebooklm.mp4`
- Create: `public/course-assets/modules/module-07/media/aprende-de-verdad-con-notebooklm.m4a`
- Create: `public/course-assets/modules/module-07/visuals/metodologia-aprendizaje-activo-digital.png`
- Create: `public/course-assets/modules/module-07/visuals/metodologia-aprendizaje-activo-sistemico.png`
- Create: `public/course-assets/modules/module-07/visuals/mapa-mental-metodologia-educacion.png`
- Create: `public/course-assets/modules/module-07/documents/notebooklm-cognitive-cartography.pdf`
- Create: `public/course-assets/modules/module-07/documents/guia-estudio-notebooklm-aprendizaje-activo.pdf`

- [ ] Create the module asset directories.
- [ ] Copy each supplied file to its stable public filename.
- [ ] Verify all seven files exist and have non-zero size.

### Task 3: Add the module 7 resource metadata

**Files:**
- Modify: `src/lib/module-resource-bundles.ts`

- [ ] Add the `modulo-7-notebooklm-para-estudiantes` bundle after module 6.
- [ ] Use the digital methodology image as the video poster and first visual.
- [ ] Register the systemic methodology image and education methodology mind map as the remaining visual cards.
- [ ] Register the 13-page presentation and 3-page study guide.
- [ ] Run `npm test -- src/lib/course.test.ts` and confirm the new test passes.

### Task 4: Verify the complete integration

**Files:**
- Verify: `src/lib/module-resource-bundles.ts`
- Verify: `src/lib/course.test.ts`
- Verify: `public/course-assets/modules/module-07/**`

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Open the module 7 page and verify playback controls, visual cards, enlargement, document tabs, and PDF embedding.
