# Module 1 Collapsible Learning Steps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present the nine active-learning steps as functional, collapsible boxes only in module 1.

**Architecture:** Add a focused `ModuleOneLearningBoxes` client component that owns the same local progress state and interactions as the current panel. Route module 1 to this component from `ActiveLearningPanel`; all other modules keep the existing rendering unchanged.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Vitest, Testing Library.

---

### Task 1: Define module-specific routing behavior

**Files:**
- Create: `src/components/module-one-learning-boxes.test.tsx`
- Modify: `src/components/active-learning-panel.tsx`

- [ ] Write a failing component test that renders module 1 and expects nine buttons named `Paso 1` through `Paso 9`.
- [ ] Add a control test that renders module 2 and confirms the existing panel remains visible without the module-1 box grid.
- [ ] Run `npm.cmd test -- --run src/components/module-one-learning-boxes.test.tsx` and confirm failure because the boxes do not exist.
- [ ] Route only `modulo-1-introduccion-historica-ia` to the new component.

### Task 2: Build the collapsible box interface

**Files:**
- Create: `src/components/module-one-learning-boxes.tsx`
- Test: `src/components/module-one-learning-boxes.test.tsx`

- [ ] Render nine responsive box headers from `learningSections`.
- [ ] Open step 1 initially.
- [ ] Implement one-open-at-a-time behavior and allow the open box to close.
- [ ] Add `aria-expanded`, `aria-controls`, keyboard-compatible buttons and visible focus styles.
- [ ] Render every existing interaction inside its corresponding panel: path, notebook, prompts, simulator, lab, quiz, flashcards, mastery checklist and rubric.
- [ ] Preserve the existing local-storage key and progress data shape.
- [ ] Verify opening step 2 closes step 1 and reveals the notebook fields.

### Task 3: Verify behavior and presentation

**Files:**
- Modify only if verification exposes a defect.

- [ ] Run the focused component test.
- [ ] Run the complete test suite.
- [ ] Run ESLint and the production build.
- [ ] Open module 1 and verify desktop layout at three columns.
- [ ] Verify mobile layout at one column.
- [ ] Confirm module 2 still uses the previous expanded layout.
