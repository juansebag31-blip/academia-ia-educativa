# Infografía general del programa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Producir e integrar una infografía general horizontal y otra vertical, basadas en el cuadernillo institucional completo y en la dirección tecnológica aprobada.

**Architecture:** La pieza se producirá mediante composición híbrida. Las fotografías tecnológicas funcionarán como fondo, mientras que retícula, paneles y textos se renderizarán de forma determinista en HTML/CSS para preservar ortografía y legibilidad. Un script de captura exportará ambas composiciones como PNG y la aplicación las presentará mediante un visor con ampliación y descarga.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, HTML/CSS, navegador automatizado, PNG.

---

## Estructura de archivos

- Crear `src/lib/program-infographic-content.ts`: contenido textual canónico y metadatos de ambas piezas.
- Crear `src/components/program-infographic-artwork.tsx`: composiciones horizontal y vertical reutilizables.
- Crear `src/app/infographic-preview/page.tsx`: superficie de renderizado sin navegación para exportar PNG.
- Crear `src/components/program-infographic-gallery.tsx`: visor, ampliación y descargas dentro de `/program`.
- Crear `public/course-assets/infographics/programa-ia-infografia-horizontal.png`.
- Crear `public/course-assets/infographics/programa-ia-infografia-vertical.png`.
- Modificar `src/app/program/page.tsx`: integrar la galería gráfica real.
- Modificar `src/lib/course.test.ts`: validar contenido, rutas y formatos.
- Crear `scripts/export-program-infographics.mjs`: exportar las dos composiciones a PNG.

### Task 1: Definir el contenido canónico

**Files:**
- Create: `src/lib/program-infographic-content.ts`
- Modify: `src/lib/course.test.ts`

- [ ] **Step 1: Añadir un test fallido**

Validar:

```ts
expect(programInfographicContent.pillars).toHaveLength(4);
expect(programInfographicContent.methodology.map((item) => item.percent)).toEqual([30, 50, 20]);
expect(programInfographicContent.moduleRoute.flatMap((group) => group.modules)).toEqual([1,2,3,4,5,6,7,8,9,10,11]);
expect(programInfographicAssets.horizontal).toBe("/course-assets/infographics/programa-ia-infografia-horizontal.png");
expect(programInfographicAssets.vertical).toBe("/course-assets/infographics/programa-ia-infografia-vertical.png");
```

- [ ] **Step 2: Ejecutar el test y verificar el fallo**

Run: `npm.cmd test -- src/lib/course.test.ts`

Expected: FAIL porque `program-infographic-content.ts` todavía no existe.

- [ ] **Step 3: Implementar el contenido**

Exportar:

```ts
export const programInfographicContent = {
  eyebrow: "Programa de Inteligencia Artificial Aplicada a la Educación con NotebookLM",
  title: "IA educativa con criterio humano",
  introduction: "Una competencia práctica, crítica y responsable para aprender, enseñar, investigar y producir con fuentes propias.",
  formula: ["Fuentes", "Preguntas", "Verificación", "Producción"],
  pillars: [
    { number: "01", title: "Nueva alfabetización", description: "Comprender fundamentos, posibilidades, límites y riesgos de la IA generativa." },
    { number: "02", title: "Fuentes propias", description: "NotebookLM convierte documentos en aprendizaje trazable y verificable." },
    { number: "03", title: "Enfoque humanista", description: "La IA amplía capacidades sin reemplazar juicio, comprensión ni responsabilidad." },
    { number: "04", title: "Aprendizaje permanente", description: "Las herramientas cambian; los fundamentos y el criterio permanecen." },
  ],
  methodology: [
    { percent: 30, label: "Teoría clara" },
    { percent: 50, label: "Práctica guiada" },
    { percent: 20, label: "Proyecto aplicado" },
  ],
  moduleRoute: [
    { label: "Fundamentos y criterio", modules: [1, 2, 3, 4] },
    { label: "Herramientas", modules: [5] },
    { label: "NotebookLM aplicado", modules: [6, 7, 8] },
    { label: "Investigación", modules: [9] },
    { label: "Proyecto final", modules: [10] },
    { label: "Actualización permanente", modules: [11] },
  ],
  outcome: "Usuarios capaces de producir conocimiento verificable y defendible con inteligencia artificial, sin renunciar al criterio humano y la responsabilidad académica.",
};
```

- [ ] **Step 4: Ejecutar el test**

Run: `npm.cmd test -- src/lib/course.test.ts`

Expected: PASS.

### Task 2: Construir las composiciones visuales

**Files:**
- Create: `src/components/program-infographic-artwork.tsx`
- Create: `src/app/infographic-preview/page.tsx`

- [ ] **Step 1: Crear el componente horizontal**

Implementar una composición fija `2400 × 1350` con:

- Fondo `#071322`.
- Retícula de 48 píxeles.
- Fotografía `module-06.jpg` en la zona derecha.
- Degradado oscuro para asegurar contraste.
- Título y fórmula a la izquierda.
- Cuatro pilares en retícula 2 × 2.
- Metodología y resultado formativo en la franja inferior.

- [ ] **Step 2: Crear el componente vertical**

Implementar una composición fija `2400 × 3000` con:

- Fondo `#071322`.
- Fotografía `module-03.jpg` en la cabecera.
- Retícula técnica.
- Título y fórmula.
- Cuatro pilares en secuencia.
- Metodología 30/50/20.
- Ruta agrupada de 11 módulos.
- Impacto en estudiantes, docentes e instituciones.
- Resultado final.

- [ ] **Step 3: Crear la ruta de previsualización**

Aceptar `?format=horizontal` y `?format=vertical`, renderizando exclusivamente la composición solicitada.

- [ ] **Step 4: Verificar TypeScript**

Run: `npx.cmd tsc --noEmit`

Expected: exit code 0.

### Task 3: Exportar PNG de alta resolución

**Files:**
- Create: `scripts/export-program-infographics.mjs`
- Create: `public/course-assets/infographics/programa-ia-infografia-horizontal.png`
- Create: `public/course-assets/infographics/programa-ia-infografia-vertical.png`

- [ ] **Step 1: Crear el directorio de salida**

Run:

```powershell
New-Item -ItemType Directory -Force -Path "public\course-assets\infographics"
```

- [ ] **Step 2: Implementar el exportador**

El script debe:

1. Abrir `/infographic-preview?format=horizontal`.
2. Fijar viewport a `2400 × 1350`.
3. Capturar el nodo `[data-infographic="horizontal"]`.
4. Guardar `programa-ia-infografia-horizontal.png`.
5. Repetir con viewport `2400 × 3000` y formato vertical.

- [ ] **Step 3: Ejecutar el servidor de producción o desarrollo**

Run: `npm.cmd run dev`

Expected: servidor disponible en un puerto local.

- [ ] **Step 4: Ejecutar el exportador**

Run: `node scripts/export-program-infographics.mjs`

Expected: dos archivos PNG no vacíos.

- [ ] **Step 5: Validar dimensiones**

Comprobar:

- Horizontal: `2400 × 1350`.
- Vertical: `2400 × 3000`.

### Task 4: Integrar visor y descargas

**Files:**
- Create: `src/components/program-infographic-gallery.tsx`
- Modify: `src/app/program/page.tsx`

- [ ] **Step 1: Crear la galería**

Incluir:

- Imagen horizontal visible.
- Botón con icono para ampliar.
- Botón para descargar horizontal.
- Botón para descargar póster vertical.
- Diálogo responsivo con cierre mediante botón y tecla Escape.

- [ ] **Step 2: Sustituir el mapa HTML anterior**

En `/program`, reemplazar la representación conceptual anterior por la galería gráfica real. Mantener el cuadernillo PDF y la estructura rápida.

- [ ] **Step 3: Validar accesibilidad**

Confirmar:

- `alt` descriptivo.
- Botones con nombres accesibles.
- Modal con `role="dialog"` y cierre visible.
- Sin texto desbordado en móvil.

### Task 5: Verificación final

**Files:**
- Test: `src/lib/course.test.ts`
- Verify: `src/app/program/page.tsx`

- [ ] **Step 1: Buscar caracteres rotos**

Run:

```powershell
rg -n "Ã|Â|�" src -g "*.ts" -g "*.tsx"
```

Expected: sin coincidencias.

- [ ] **Step 2: Ejecutar verificaciones**

Run:

```powershell
npx.cmd tsc --noEmit
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Expected: todos los comandos terminan correctamente.

- [ ] **Step 3: Reiniciar producción**

Run: `npm.cmd run start -- -p 3000`

Expected: `/program` responde HTTP 200.

- [ ] **Step 4: Verificar en navegador**

Comprobar:

- La imagen horizontal aparece en `/program`.
- La ampliación funciona.
- Ambas descargas responden.
- No hay solapamientos en escritorio ni móvil.
- Las fotografías, la retícula y todos los textos se renderizan correctamente.
