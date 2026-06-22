# Landing SEO y captación para Academia IA Educativa

**Fecha:** 2026-06-22  
**Estado:** diseño aprobado  
**Proyecto:** Academia IA Educativa

## 1. Objetivo

Crear una landing pública moderna que reemplace la portada actual de la plataforma, atraiga tráfico orgánico y convierta visitantes en estudiantes o suscriptores.

El curso continuará siendo gratuito y accesible sin entregar datos personales. La captación de correos será voluntaria y estará asociada a un recurso adicional: un kit gratuito de prompts para docentes y estudiantes.

La primera etapa no implementará publicidad, afiliados ni productos pagos. Su propósito será validar demanda, aumentar las visitas al curso y construir una lista de correos que permita monetización posterior.

## 2. Público y posicionamiento

### Público principal

- Docentes que quieren incorporar inteligencia artificial y NotebookLM en planificación, materiales, investigación y evaluación.
- Estudiantes que quieren comprender contenidos, estudiar con fuentes y desarrollar mejores métodos de aprendizaje.

### Propuesta de valor

Una formación gratuita y práctica para aprender inteligencia artificial y NotebookLM con criterio, fuentes confiables y resultados aplicables a la educación.

### Búsquedas objetivo

Consulta principal:

- `curso de inteligencia artificial gratis para docentes y estudiantes`

Consultas secundarias:

- `curso de IA educativa`
- `IA para docentes`
- `IA para estudiantes`
- `aprender NotebookLM`
- `NotebookLM para educación`
- `curso gratuito de inteligencia artificial`

Los textos deberán responder estas intenciones de búsqueda de forma natural. No se repetirá una palabra clave de manera artificial.

## 3. Enfoque aprobado

Se implementará una landing SEO orientada a conversión, integrada en la aplicación existente.

El enfoque combina:

- una propuesta de valor clara;
- contenido público renderizado en servidor;
- acceso directo al curso;
- resumen indexable del programa;
- beneficios concretos para docentes y estudiantes;
- preguntas frecuentes;
- captación de correos mediante un recurso útil.

La arquitectura quedará preparada para añadir posteriormente un centro de recursos o artículos, pero ese contenido editorial no forma parte de esta primera implementación.

## 4. Arquitectura de rutas

La solución permanecerá dentro del proyecto Next.js existente.

- `/`: nueva landing pública sin sidebar ni cabecera del dashboard.
- `/dashboard`: dashboard educativo que actualmente ocupa la portada.
- `/program`, `/modules`, `/visual`, `/calendar`, `/live-classes`, `/reflection`, `/courses/*`, `/auth/*` y `/account`: conservan sus URLs.

Se usarán layouts separados mediante route groups de Next.js:

- layout de marketing para la landing;
- layout de aplicación para la plataforma educativa y sus herramientas.

El layout raíz conservará únicamente responsabilidades globales como idioma, estilos base y metadatos compartidos. La landing no dependerá de la sesión del usuario para poder renderizarse y cachearse de forma eficiente.

Todos los enlaces internos que antes apuntaban a `/` como dashboard pasarán a `/dashboard`. El logotipo de la plataforma podrá dirigir a la landing, mientras que el enlace de navegación `Cursos` dirigirá al dashboard.

## 5. Dirección visual

### Estilo

Dirección seleccionada: **Laboratorio tecnológico**, variante **Neural blue + magenta**.

La identidad debe comunicar tecnología, energía y producto digital sin perder credibilidad educativa.

### Paleta

- Fondo principal: azul noche casi negro.
- Color primario: azul eléctrico.
- Acento: magenta, usado con moderación en gradientes, llamadas a la acción y detalles.
- Texto principal: blanco frío.
- Texto secundario: azul grisáceo de alto contraste.
- Secciones claras puntuales para separar el programa y mejorar el ritmo visual.

El magenta no será el color dominante del contenido ni del texto. Su función es aportar energía promocional.

### Principios de interfaz

- Tipografía grande y directa en el hero.
- Alto contraste y foco visible para navegación por teclado.
- Gradientes y efectos luminosos construidos con CSS, sin imágenes pesadas.
- Movimiento reducido y compatible con `prefers-reduced-motion`.
- Diseño responsive desde 320 px.
- Componentes con límites claros: navegación, hero, métricas, beneficios, programa, captación, FAQ y footer.

## 6. Estructura de la landing

### 6.1 Navegación

- Marca `ACADEMIA/IA`.
- Enlaces ancla: `Qué aprenderás`, `Programa`, `Preguntas`.
- Acción principal: `Entrar al curso`, dirigida a `/dashboard`.
- Navegación móvil accesible.

### 6.2 Hero

Etiqueta: `Curso gratuito · IA + NotebookLM`.

Título base:

> Aprendé inteligencia artificial. Enseñá y estudiá mejor.

Descripción:

> Una formación gratuita y práctica para docentes y estudiantes que quieren usar IA con criterio, fuentes confiables y resultados reales.

Acciones:

- `Empezar el curso gratis` → `/dashboard`.
- `Ver el programa` → sección de programa en la landing.

### 6.3 Evidencia rápida

- 11 módulos progresivos.
- 33 lecciones prácticas.
- 22 horas sugeridas.
- Acceso 100 % gratuito.

No se mostrarán métricas de usuarios, testimonios o resultados que no estén respaldados por datos reales.

### 6.4 Beneficios

Tres resultados:

1. Comprender la IA sin tecnicismos innecesarios.
2. Aplicar NotebookLM para aprender y enseñar.
3. Verificar información con criterio, ética y evidencia.

### 6.5 Programa

Resumen visible e indexable de los 11 módulos, con enlace a `/modules` y enlaces internos cuando sean útiles. El resumen deberá explicar la progresión desde fundamentos hasta un proyecto final aplicado.

### 6.6 Captación

Oferta: kit gratuito de prompts para docentes y estudiantes.

El formulario solicitará:

- nombre opcional;
- correo obligatorio;
- consentimiento explícito para recibir el recurso y comunicaciones relacionadas.

Estados visibles:

- inicial;
- enviando;
- éxito con descarga del kit;
- correo ya registrado;
- validación incorrecta;
- error temporal con opción de reintento.

### 6.7 Preguntas frecuentes

Preguntas iniciales:

- ¿El curso es realmente gratuito?
- ¿Necesito conocimientos previos?
- ¿Está pensado para docentes o estudiantes?
- ¿Incluye certificados?
- ¿Qué es NotebookLM y para qué sirve?

Las respuestas estarán presentes en el HTML renderizado. La interacción de acordeón será accesible y no ocultará el contenido a los buscadores.

### 6.8 Footer

- Descripción breve de Academia IA Educativa.
- Acceso al curso.
- Privacidad.
- Contacto.
- Opción de baja de comunicaciones.

## 7. SEO técnico

### Metadatos

La landing tendrá metadatos específicos mediante la Metadata API de Next.js:

- título único;
- descripción;
- URL canónica;
- Open Graph;
- Twitter Card;
- imagen social propia;
- idioma `es`.

### Indexación

- `sitemap.xml` generado desde Next.js.
- `robots.txt` que permita indexar contenido público y excluya `/account`, `/auth`, `/api` y rutas técnicas de Next.js. Esta exclusión no sustituye controles de autorización.
- enlaces internos rastreables mediante elementos `a` reales.
- jerarquía de un solo `h1`, seguida por `h2` y `h3` coherentes.
- HTML semántico renderizado en servidor.

### Datos estructurados

- `Course` para describir el curso real.
- `Organization` para Academia IA Educativa.

El JSON-LD deberá corresponder exactamente al contenido visible. No se añadirán reseñas, calificaciones, precios ni afirmaciones inexistentes.

Las preguntas frecuentes se estructurarán semánticamente para usuarios. No se dependerá de `FAQPage` como fuente de resultados enriquecidos, ya que su visibilidad en buscadores no está garantizada para este tipo de sitio.

### Rendimiento

- hero sin video automático ni recursos multimedia pesados;
- efectos visuales en CSS;
- JavaScript cliente limitado a navegación móvil, FAQ y formulario;
- imágenes optimizadas con dimensiones explícitas;
- carga diferida bajo el pliegue;
- objetivo de buena experiencia en Core Web Vitals y ausencia de cambios de layout evitables.

No se prometerá una posición concreta en buscadores. El resultado orgánico dependerá también de antigüedad, competencia, enlaces externos y contenido futuro.

## 8. Captación, datos y entrega del kit

### Persistencia

Supabase almacenará una fila por correo normalizado. El modelo mínimo incluirá:

- identificador;
- correo normalizado único;
- nombre opcional;
- consentimiento y fecha;
- origen de captación;
- fecha de alta;
- estado de baja.

La escritura se realizará en el servidor. El navegador no tendrá permisos para consultar la lista de suscriptores.

### Protección

- validación compartida de datos;
- campo honeypot;
- limitación en servidor de cinco intentos cada 15 minutos por origen; se almacenará únicamente un hash temporal del origen, nunca la dirección IP en claro;
- respuestas que no expongan información interna;
- política de privacidad accesible desde el formulario;
- mecanismo de baja antes de iniciar campañas.

### Entrega

Resend será el proveedor recomendado para enviar el kit cuando exista una clave de servidor válida.

La implementación deberá funcionar también sin Resend:

1. se registra el correo en Supabase;
2. se muestra el estado de éxito;
3. se habilita una descarga segura del kit.

El recurso no bloqueará el acceso al curso. La ausencia de Supabase no se ocultará como éxito: se mostrará un error temporal y el resto de la landing continuará disponible.

## 9. Analítica y publicación

La primera publicación deberá dejar preparada la verificación posterior de:

- Google Search Console;
- envío del sitemap;
- indexación de la portada;
- clics en `Empezar el curso gratis`;
- envíos válidos del formulario;
- descargas del kit.

La analítica no deberá retrasar el renderizado principal ni cargar rastreadores sin la configuración de privacidad necesaria.

## 10. Accesibilidad

- contraste WCAG AA para texto y controles;
- navegación completa por teclado;
- foco visible;
- etiquetas y mensajes de error asociados al formulario;
- regiones de estado anunciadas para éxito y error;
- acordeones con `button`, `aria-expanded` y relación explícita con su contenido;
- respeto por preferencias de reducción de movimiento;
- textos alternativos útiles en imágenes informativas.

## 11. Pruebas y verificación

### Pruebas automatizadas

- renderizado de las secciones y acciones principales;
- destinos correctos de enlaces;
- metadatos y JSON-LD válidos;
- generación de sitemap y robots;
- validación del formulario;
- correo duplicado idempotente;
- errores de Supabase y Resend;
- accesibilidad básica de FAQ y formulario.

### Verificación manual

- responsive en móvil, tablet y escritorio;
- navegación por teclado;
- contraste y reducción de movimiento;
- flujo completo de captación y descarga;
- dashboard accesible desde `/dashboard`;
- rutas educativas existentes sin regresiones;
- Lighthouse y revisión de Core Web Vitals en producción;
- validación del JSON-LD;
- comprobación de `sitemap.xml`, `robots.txt`, canonical e imagen social.

## 12. Fuera de alcance

- publicidad mediante AdSense;
- enlaces de afiliados;
- pagos, mentorías o contenido premium;
- blog o centro editorial completo;
- testimonios inventados;
- migración del contenido del curso a otra aplicación;
- rediseño integral de todas las pantallas educativas.

## 13. Criterios de aceptación

El diseño se considerará implementado cuando:

1. `/` presente la landing aprobada sin el shell del dashboard.
2. `/dashboard` contenga el dashboard actual y todas las rutas educativas sigan funcionando.
3. la landing sea responsive, accesible y coherente con la paleta Neural blue + magenta.
4. el contenido principal sea visible en HTML renderizado y tenga metadatos, canonical, sitemap, robots y JSON-LD coherentes.
5. las llamadas a la acción conduzcan correctamente al curso y al programa.
6. el formulario registre suscriptores únicos en Supabase, maneje errores y habilite la entrega del kit.
7. exista una página de privacidad y una ruta definida para baja antes de enviar campañas.
8. las pruebas, lint y build del proyecto finalicen correctamente.
