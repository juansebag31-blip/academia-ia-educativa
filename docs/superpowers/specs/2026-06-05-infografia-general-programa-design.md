# Diseño de la infografía general del programa

## Objetivo

Crear dos infografías gráficas profesionales basadas en el análisis del cuadernillo institucional completo de 95 páginas:

- Una versión horizontal para integrarla en la página `/program`.
- Una versión vertical de alta resolución para ampliar, descargar e imprimir.

Ambas piezas deben resumir el programa sin intentar reproducir las 95 páginas. La finalidad es ofrecer una visión inmediata de su enfoque, metodología, recorrido e impacto.

## Fuente de contenido

Documento principal:

`MODULO Y CUADERNILLO/Cuadernillo_Institucional_Programa_IA_Educativa_NotebookLM_COMPLETO.pdf`

La síntesis visual se basa en:

- Presentación ejecutiva y propósito institucional.
- Fundamentación académica.
- Objetivos generales y específicos.
- Metodología didáctica.
- Estructura de los 11 módulos.
- Evaluación y proyecto final.
- Resultados para estudiantes, docentes e instituciones.
- Enfoque humanista y aprendizaje permanente.

## Dirección visual aprobada

Estilo tecnológico institucional, coherente con el dashboard de Academia IA:

- Fondo azul negro profundo.
- Retícula técnica fina.
- Fotografías tecnológicas relacionadas con IA, documentos, datos y aprendizaje.
- Superficies translúcidas con contraste suficiente.
- Azul gris claro para información destacada.
- Naranja únicamente como acento menor, no como fondo dominante.
- Tipografía sans serif sólida, legible y profesional.
- Sin caricaturas, estética infantil, robots genéricos ni exceso de efectos futuristas.

La fotografía debe funcionar como contexto y no competir con el contenido.

## Contenido común

### Encabezado

**Programa de Inteligencia Artificial Aplicada a la Educación con NotebookLM**

Título principal:

**IA educativa con criterio humano**

Texto introductorio:

**Una competencia práctica, crítica y responsable para aprender, enseñar, investigar y producir con fuentes propias.**

### Fórmula metodológica

**Fuentes → Preguntas → Verificación → Producción**

### Cuatro pilares

1. **Nueva alfabetización**  
   Comprender fundamentos, posibilidades, límites y riesgos de la IA generativa.

2. **Fuentes propias**  
   NotebookLM convierte documentos en aprendizaje trazable y verificable.

3. **Enfoque humanista**  
   La IA amplía capacidades sin reemplazar juicio, comprensión ni responsabilidad.

4. **Aprendizaje permanente**  
   Las herramientas cambian; los fundamentos y el criterio permanecen.

### Metodología

- 30% teoría clara.
- 50% práctica guiada.
- 20% proyecto aplicado.

### Resultado formativo

**Usuarios capaces de producir conocimiento verificable y defendible con inteligencia artificial, sin renunciar al criterio humano y la responsabilidad académica.**

## Versión horizontal

Formato recomendado: 16:9, mínimo 2400 × 1350 píxeles.

Composición:

- Zona izquierda: título, introducción y fórmula metodológica.
- Zona derecha: cuatro pilares en una retícula 2 × 2.
- Franja inferior: metodología 30/50/20 y resultado formativo.
- Fotografía tecnológica extendida en el fondo derecho.
- Retícula técnica sobre toda la composición.

Uso:

- Integración principal en `/program`.
- Apertura en modal o visor ampliado.
- Descarga opcional.

## Versión vertical

Formato recomendado: relación 4:5 o A4 vertical, mínimo 2400 × 3000 píxeles.

Composición:

- Cabecera con fotografía tecnológica, título e introducción.
- Fórmula metodológica.
- Cuatro pilares en secuencia vertical.
- Metodología 30/50/20.
- Ruta agrupada de los 11 módulos:
  - Módulos 1-4: fundamentos y criterio.
  - Módulo 5: herramientas.
  - Módulos 6-8: NotebookLM aplicado.
  - Módulo 9: investigación.
  - Módulo 10: proyecto final.
  - Módulo 11: actualización permanente.
- Impacto en estudiantes, docentes e instituciones.
- Resultado formativo final.

Uso:

- Descarga en alta resolución.
- Impresión.
- Material de presentación institucional.

## Producción visual

Se usará un método híbrido:

1. Generar o seleccionar el fondo tecnológico y los recursos visuales.
2. Componer el texto de forma programática para garantizar ortografía, nitidez y consistencia.
3. Exportar PNG de alta resolución.
4. Verificar legibilidad en escritorio y móvil.

Los textos no se confiarán por completo a un generador de imágenes, para evitar errores ortográficos.

## Integración en la aplicación

La página `/program` incluirá:

- La infografía horizontal visible dentro del flujo principal.
- Botón para ampliar.
- Botón para descargar la versión horizontal.
- Botón para descargar el póster vertical.

Los archivos se guardarán bajo:

`public/course-assets/infographics/`

Nombres previstos:

- `programa-ia-infografia-horizontal.png`
- `programa-ia-infografia-vertical.png`

## Verificación

- Comparar todos los textos de la imagen con este documento.
- Confirmar que no existan caracteres rotos.
- Revisar contraste y legibilidad.
- Verificar que ambas imágenes abran y descarguen correctamente.
- Comprobar la integración en `/program` en escritorio y móvil.
- Ejecutar TypeScript, tests, lint y build de producción.
