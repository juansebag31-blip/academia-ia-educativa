# Módulo 1: pasos desplegables

## Objetivo

Reorganizar exclusivamente el bloque "Proceso guiado del módulo" del módulo 1 para que sus nueve pasos se presenten como boxes independientes, compactos y desplegables.

## Alcance

- Aplicar el nuevo formato solo a `modulo-1-introduccion-historica-ia`.
- Mantener sin cambios los módulos 2 a 11.
- Conservar todo el contenido, progreso, formularios y acciones existentes.
- No modificar todavía la selección general de módulos.

## Interacción

- Mostrar nueve boxes numerados, uno por cada paso.
- Cada box presenta número, título, descripción breve, estado y progreso cuando corresponda.
- Al pulsar un box, se despliega su contenido completo debajo del encabezado.
- Solo un box permanece abierto a la vez.
- El paso 1 aparece abierto inicialmente.
- El usuario puede cerrar el box abierto pulsándolo nuevamente.
- Los controles internos no deben cerrar accidentalmente el box.

## Estructura visual

- Escritorio: cuadrícula de tres columnas.
- Tableta: cuadrícula de dos columnas.
- Móvil: una columna.
- Estado cerrado: tarjeta compacta con borde superior naranja, número, título y estado.
- Estado abierto: tarjeta a ancho completo, con encabezado destacado y contenido debajo.
- Estados completados: acento verde sin sustituir la identidad naranja del curso.
- Mantener tipografía, colores, bordes y sombras del diseño actual.

## Contenido de los boxes

1. Ruta progresiva del módulo.
2. Cuaderno del estudiante.
3. Plantillas de prompts.
4. Simulador NotebookLM.
5. Laboratorio práctico.
6. Mini quiz de práctica.
7. Flashcards internas.
8. Checklist de dominio.
9. Rúbrica del producto.

Cada contenido reutiliza la funcionalidad actual: almacenamiento local, checkboxes, textos, copia de prompts, respuestas del quiz y giro de flashcards.

## Implementación

- Añadir una variante de presentación al componente `ActiveLearningPanel`.
- Activar la variante mediante el slug del módulo 1.
- Extraer los nueve contenidos a bloques reutilizables para evitar duplicación.
- Mantener el formato actual como comportamiento predeterminado para los módulos 2 a 11.
- Guardar únicamente el progreso académico existente; el box abierto puede ser estado temporal de interfaz.

## Accesibilidad

- Cada encabezado será un botón real.
- Incluir `aria-expanded` y asociación con su panel.
- Permitir navegación y activación mediante teclado.
- Mantener foco visible y contraste suficiente.

## Verificación

- Prueba que confirme que la variante solo se activa en el módulo 1.
- Prueba de apertura y cierre de boxes.
- Prueba de que solo un paso queda abierto.
- Prueba de persistencia del progreso existente.
- Revisión visual en escritorio y móvil.
- Ejecutar pruebas completas, lint y build.
