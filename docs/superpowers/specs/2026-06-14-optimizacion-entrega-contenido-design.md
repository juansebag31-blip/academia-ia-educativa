# Diseño de optimización de entrega de contenido

## Objetivo

Reducir el tiempo de carga inicial del curso sin cambiar textos, imágenes visibles,
documentos, audios ni videos.

## Arquitectura

- Mantener los archivos originales como fuente y descarga.
- Crear derivados WebP de las imágenes PNG/JPG utilizadas en pantalla.
- Crear copias PDF optimizadas únicamente cuando conserven cantidad de páginas y
  texto extraído.
- No montar `iframe`, `audio` ni `video` hasta que el estudiante pulse el control
  correspondiente.
- Mantener YouTube con su miniatura actual y crear el `iframe` solo al reproducir.
- Servir los derivados desde el mismo bucket `course-assets/v2`.
- Aplicar caché pública larga a recursos versionados.

## Límites de fidelidad

- Las imágenes mantienen dimensiones y perfil de color visible.
- Las descargas siguen apuntando al original cuando el derivado es solo de
  visualización.
- Un PDF optimizado se acepta solo si conserva páginas y texto; de lo contrario se
  conserva el original.
- El contenido editorial y los datos del curso no se modifican.

## Verificación

- Pruebas de componentes para confirmar carga bajo demanda.
- Comparación automática de imágenes y tamaños.
- Comparación automática de páginas y texto de PDF.
- Pruebas, lint y build completos.
- Verificación HTTP y visual en producción.
