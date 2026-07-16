# Preparación e integración de un módulo

## 1. Crear el paquete

Copiar la plantilla sin modificar el original:

```powershell
Copy-Item -Recurse `
  "course-content\ai-engineering\templates\module-package" `
  "C:\ruta\de\trabajo\modulo-nuevo"
```

Reemplazar todos los `TODO_*` con contenido aprobado. Incorporar HTML fundacional, infografía, MP3, transcripción, al menos un caso, PPTX, diapositivas preexportadas y fuentes.

No cambiar `editorialStatus` a `approved` ni `publish` a `true` sin validación humana.

## 2. Validar

```powershell
npm.cmd run content:validate:ai-engineering-module -- --package "C:\ruta\de\trabajo\modulo-nuevo"
```

Errores frecuentes:

- `TODO_*`: queda un placeholder editorial o técnico.
- `missing`: falta un archivo declarado.
- `missing section` o `missing anchor`: el manifiesto apunta a un ID inexistente.
- `declares N ... but found M`: la cantidad declarada no coincide con preguntas o diapositivas.
- `cannot publish`: `publish` está activo sin aprobación editorial.
- `not part of the approved course itinerary`: número, título o slug editorial no coincide con el manifiesto general.

## 3. Preparar sin publicar

```powershell
npm.cmd run content:prepare:ai-engineering-module -- `
  --package "C:\ruta\de\trabajo\modulo-nuevo" `
  --output "$env:TEMP\ai-engineering-preview"
```

Esta operación comprueba el procesamiento y copia los medios a una salida temporal. No registra rutas públicas.

## 4. Aprobar e integrar

Después de la aprobación humana, establecer:

```json
{
  "editorialStatus": "approved",
  "publish": true
}
```

Integrar:

```powershell
npm.cmd run content:integrate:ai-engineering-module -- --package "C:\ruta\de\trabajo\modulo-nuevo"
```

El comando copia el paquete a `course-content/ai-engineering/modules/<editorialSlug>/`, actualiza el manifiesto general y regenera la colección pública. Si la preparación falla, revierte esos cambios automáticos.

## 5. Probar localmente

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

Comprobar portada, ruta del módulo, medios, teclado, teléfono y aislamiento del progreso.

## 6. Crear preview

Solo con autorización explícita:

```powershell
npx.cmd vercel --yes
```

Verificar la URL de portada, módulo, MP3, infografía, diapositivas y PPTX antes de informar el preview.

## 7. Revertir

Antes de un commit, eliminar únicamente la carpeta recién integrada, restaurar su entrada en `course-manifest.json` y ejecutar nuevamente `npm.cmd run content:prepare:ai-engineering`.

Después de un commit independiente, utilizar `git revert <hash-del-commit>` y volver a ejecutar pruebas, lint y build. No usar `git reset --hard`.
