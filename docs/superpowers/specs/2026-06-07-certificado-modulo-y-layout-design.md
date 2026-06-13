# Certificado de aprobación y corrección de layout

## Objetivo

Eliminar el espacio vacío entre los pasos 6 y 8 del aprendizaje activo y añadir un certificado PDF descargable para el Módulo 1.

## Layout de aprendizaje

- Mantener el orden progresivo actual.
- Mostrar las flashcards del paso 7 en dos columnas en escritorio.
- Reducir la altura mínima de cada flashcard para equilibrarla con el mini quiz.
- Conservar una columna en móvil.
- Permitir que los pasos 8 y 9 aparezcan inmediatamente después de la fila de los pasos 6 y 7.

## Certificado

- Denominación: `Certificado de aprobación`.
- Estilo: tecnológico académico, horizontal, fondo azul oscuro, cuadrícula y acentos celestes.
- Estudiante inicial: `Juan Sebastian González`.
- Módulo: Módulo 1, Introducción histórica a la Inteligencia Artificial.
- Duración: `6 horas estimadas`.
- Requisito: último intento aprobado con un resultado mínimo del 80%.
- Incluir fecha de aprobación, porcentaje obtenido, producto esperado e identificador interno.
- Emisor: `Academia IA Educativa`.
- Declaración: certificación académica interna, sin atribuir aval oficial o externo.

## Comportamiento

- Si el módulo no está aprobado, el cierre mostrará el certificado bloqueado y explicará el requisito.
- Si está aprobado, aparecerá un botón `Descargar certificado PDF`.
- La descarga se generará en una ruta del servidor que vuelve a validar el intento aprobado.
- Una petición sin aprobación recibirá estado HTTP 403.

## Reutilización

La metadata, la validación y el generador serán independientes del Módulo 1 para permitir certificados de los módulos 2 al 11 más adelante.

## Verificación

- Pruebas de elegibilidad, duración, identificador y generación PDF.
- Verificación de la ruta autorizada y bloqueada.
- Revisión visual en escritorio y móvil.
- Confirmación de ausencia de desbordamiento horizontal y del hueco de layout.
