---
name: course-module-builder
description: Validate, prepare, and integrate approved module packages for the AI Engineering Aplicado course in the academia-ia-educativa repository. Use when Codex receives a module package path and must verify its manifest, approved pedagogical files, media, visual placements, presentation slides, progress units, catalog eligibility, tests, lint, and build without inventing content, changing the original course, merging, or deploying.
---

# Course Module Builder

## Required input

Require an absolute path to a module package containing `module-manifest.json`.

Read the repository `AGENTS.md`, the package manifest, and [references/module-contract.md](references/module-contract.md) before changing files.

## Workflow

1. Confirm the active repository is `C:\Users\juans\Projects\Curso de IA` and inspect Git status.
2. Run validation only:

   ```powershell
   npm.cmd run content:validate:ai-engineering-module -- --package "<absolute-package-path>"
   ```

3. Stop on missing files, invalid types, unresolved `TODO_*`, mismatched quantities, unsupported visuals, or invalid anchors. Report errors without drafting replacement content.
4. Confirm that module number, title, and editorial slug match `course-content/ai-engineering/course-manifest.json`.
5. Prepare a private copy when visual inspection is needed:

   ```powershell
   npm.cmd run content:prepare:ai-engineering-module -- --package "<absolute-package-path>" --output "<temporary-output-path>"
   ```

6. Require explicit human approval before public registration. Integrate only when `editorialStatus` is `approved` and `publish` is `true`:

   ```powershell
   npm.cmd run content:integrate:ai-engineering-module -- --package "<absolute-package-path>"
   ```

7. Verify generated data, stable asset routes, catalog resolution, module progress isolation, and the existing Module 1 route.
8. Run `npm.cmd test`, `npm.cmd run lint`, and `npm.cmd run build`.
9. Deliver an integration report with package identity, declared counts, copied files, generated routes, validation results, Git changes, risks, and actions requiring human approval.

## Content boundaries

- Do not write, summarize, repair, or translate pedagogical content.
- Do not invent objectives, cases, sources, questions, answers, visual text, or media.
- Do not copy text from Module 1 into another module.
- Do not mark incomplete material as reviewed or approved.
- Do not bypass `TODO_*` rejection.
- Do not expose M4A files in `public/`.
- Do not modify the original NotebookLM course.
- Do not merge, commit, deploy, or promote a preview without explicit authorization.

## Failure handling

Keep the package unregistered when any validation fails. Preserve the original package, report the exact manifest path or source file involved, and identify whether correction belongs to editorial review, asset production, or technical integration.
