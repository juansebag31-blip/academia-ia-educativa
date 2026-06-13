# Tema visual IA Cognitiva

## Objetivo

Reemplazar la identidad naranja actual por una paleta relacionada con inteligencia
artificial, tecnología educativa y confianza académica, sin modificar la estructura,
el contenido ni el comportamiento del curso.

## Paleta aprobada

| Función | Color | Uso |
| --- | --- | --- |
| Tinta principal | `#071A2B` | Sidebar, paneles oscuros y encabezados |
| Acción primaria | `#2563EB` | Botones, navegación activa y enlaces destacados |
| Acento tecnológico | `#06B6D4` | Indicadores, iconos y detalles interactivos |
| Acento cognitivo | `#7C3AED` | Gradientes, etiquetas especiales y recursos de IA |
| Fondo general | `#F5F8FC` | Fondo de páginas |
| Superficie | `#FFFFFF` | Tarjetas, boxes y paneles |
| Texto principal | `#071A2B` | Títulos y contenido de alta jerarquía |
| Texto secundario | `#526175` | Descripciones y metadatos |

Los colores semánticos de éxito, advertencia y error conservarán verde, ámbar y rojo
para no confundir estados funcionales con la identidad de marca.

## Aplicación visual

### Navegación y estructura

- La barra lateral utilizará tinta principal con matices azulados.
- El elemento activo utilizará azul tecnológico, con contraste blanco.
- El logotipo y los indicadores secundarios combinarán cian y violeta.
- El encabezado conservará una superficie clara para mantener legibilidad.

### Botones y estados interactivos

- Las acciones primarias pasarán de naranja a azul tecnológico.
- Los estados hover usarán una versión más oscura del azul.
- Los anillos de foco serán cian para mejorar visibilidad y coherencia.
- Los controles seleccionados podrán incorporar un gradiente azul-cian muy sutil.

### Boxes, tarjetas y ruta de aprendizaje

- Los bordes superiores y pasos activos utilizarán azul.
- Los fondos suaves naranjas serán reemplazados por azules muy claros.
- El violeta se reservará para elementos relacionados con generación, IA o síntesis.
- El cian identificará interacción, exploración y recursos multimedia.

### Secciones oscuras

- La biblioteca de recursos, documentos, evaluaciones y multimedia conservará su
  composición oscura, pero cambiará del negro azulado actual a `#071A2B`.
- Los botones claros de estas secciones usarán azul muy pálido o cian pálido.
- Los fondos de visor mantendrán alta oscuridad para no competir con imágenes y PDF.

### Portada

- El hero tendrá un gradiente de tinta principal a azul profundo.
- Los resplandores naranjas se sustituirán por cian y violeta con baja opacidad.
- La llamada a la acción principal será azul tecnológico.

## Estrategia técnica

1. Actualizar los tokens globales de Tailwind y CSS.
2. Mantener temporalmente los alias internos `ember` y `ember-dark`, pero cambiar sus
   valores a azul para evitar una modificación masiva y riesgosa.
3. Sustituir las clases directas `orange-*` por equivalentes `blue-*`, `cyan-*` o
   `violet-*` según su función.
4. No alterar los colores semánticos de resultados y validaciones.
5. Verificar contraste, estados hover/focus y comportamiento responsive.

## Alcance

El cambio se aplicará a todas las páginas y a los once módulos:

- portada y tarjetas de módulos;
- navegación lateral y superior;
- ruta de aprendizaje;
- recursos multimedia y documentos;
- cuestionarios y evaluaciones;
- botones de módulo anterior y siguiente;
- ampliación de imágenes.

No se modificarán textos, recursos, imágenes, videos, progreso ni lógica del curso.

## Validación

- Ejecutar las pruebas automatizadas existentes.
- Ejecutar lint y build de producción.
- Revisar visualmente portada, módulo intermedio, primer módulo, último módulo y examen.
- Comprobar foco por teclado y contraste de textos y botones principales.
- Confirmar que ningún estado informativo dependa únicamente del color.
