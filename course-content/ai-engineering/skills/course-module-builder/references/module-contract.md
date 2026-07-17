# AI Engineering Module Contract

## Publication gate

A module enters the public catalog only when both conditions are true:

```json
{
  "editorialStatus": "approved",
  "publish": true
}
```

`draft` and `reviewed` packages may be validated and privately prepared but must not be registered publicly.

## Required pedagogy

Require foundational content, an infographic, MP3 audio with transcript, at least one real case, a presentation with preexported slides, an open activity, an open self-assessment, sources, and at least one progress unit.

Read counts from the manifest. Do not assume a fixed number of cases, questions, slides, visuals, or progress units.

## Source and generated files

Treat every path in the module package as source material. Keep MP3 and optional M4A in the package, but copy only MP3 to `public/`. Keep PPTX and slide exports as source; copy both PPTX and declared slides for web delivery.

Generated application data belongs under `src/generated/ai-engineering/`. Generated public assets belong under `public/ai-engineering-assets/<publicSlug>/`. Both locations are rebuilt from source and are ignored by Git.

## Manifest sections

- `schemaVersion`, `sourceVersion`, `courseSlug`: technical versioning.
- `module.editorialSlug`, `publicSlug`, `number`: routing and itinerary identity.
- `editorialStatus`, `publish`: independent editorial and publication controls.
- `title`, `level`, `estimatedStudyMinutes`: editorial metadata.
- `content`: foundational HTML and selectors for objectives, activity, questions, and sources.
- `assets`: infographic, audio, cases, PPTX, slides, dimensions, and accessible text.
- `interactions`: activity and self-assessment storage units and labels.
- `progressUnits`: variable ordered collection of IDs, kinds, anchors, and labels.
- `visuals`, `keyIdeas`: optional declarative placements after real source sections.
  - Programmatic visuals use `visualId`, `title`, `description`, and a supported `componentType`.
  - Image visuals use `visualId`, `sourcePath`, `alt`, `width`, and `height`; preparation copies them under the module's public `visuals/` directory.
  - Key ideas may include an optional editorial `title` in addition to `ideaId` and `text`.

## Human approval points

Require approval before changing `editorialStatus` to `approved`, changing `publish` to `true`, registering the package, creating a commit, generating a Vercel preview, merging, or deploying to production.
