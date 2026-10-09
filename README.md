# Academia IA Educativa

Plataforma educativa gratuita en español para aprender fundamentos de inteligencia artificial, uso responsable de herramientas y AI Engineering mediante recorridos prácticos y accesibles.

[Ver demo](https://academia-ia-educativa.vercel.app) · [Ver portfolio profesional](https://portfolio-juan-sebastian.vercel.app)

## Problema

El aprendizaje de inteligencia artificial suele quedar disperso entre herramientas, tutoriales y conceptos técnicos. Esto dificulta que estudiantes y docentes construyan un recorrido ordenado, practiquen con criterio y conserven evidencia de su avance.

## Solución

Academia IA Educativa reúne contenido, actividades, evaluaciones y recursos multimedia en una aplicación web responsive. El acceso base no requiere registro: una persona puede comenzar el curso y guardar su progreso en el navegador. Las cuentas gratuitas agregan autenticación y sincronización mediante Supabase.

El repositorio contiene dos recorridos:

- **Academia IA Educativa:** 11 módulos sobre fundamentos, uso responsable, herramientas educativas y NotebookLM.
- **AI Engineering Aplicado:** 12 módulos sobre modelos, contexto, herramientas y APIs, RAG, workflows, agentes, evaluación, seguridad y producción.

## Funcionalidades verificadas

- Landing pública y catálogo de cursos.
- Módulos, lecciones, actividades, reflexión y calendario de estudio.
- Recursos diferidos: videos, audios, documentos, presentaciones e infografías se cargan bajo demanda.
- Exámenes por módulo, corrección automática y certificado PDF al alcanzar el criterio de aprobación.
- Progreso local para visitantes mediante `localStorage`.
- Registro, inicio de sesión, recuperación de contraseña y cuenta con Supabase Auth.
- Importación del progreso local a una cuenta autenticada.
- Persistencia de progreso, actividades, intentos de examen y certificados en PostgreSQL/Supabase, protegida con RLS.
- Kit gratuito de prompts entregado mediante enlace firmado; el envío por Resend es opcional.
- Diseño responsive y rutas públicas con metadatos para buscadores.

## Stack

### Frontend

- Next.js 15 con App Router
- React 19
- TypeScript
- Tailwind CSS y `@tailwindcss/typography`
- Lucide React

### Backend y datos

- Route Handlers y Server Actions de Next.js
- Supabase Auth, PostgreSQL y Storage
- `@supabase/ssr` y `@supabase/supabase-js`
- SQLite con `better-sqlite3` y Drizzle ORM para el catálogo/datos locales del proyecto
- `pdf-lib` para certificados

### Testing

- Vitest
- Testing Library
- jsdom
- ESLint

### Infraestructura y contenido

- Vercel
- Supabase Storage para multimedia optimizada en producción
- Scripts TypeScript para importar, preparar y validar contenido
- Python para generar el kit PDF de prompts

## Arquitectura

```mermaid
flowchart LR
    U[Visitante o estudiante] --> N[Next.js App Router]
    N --> C[Catálogo y contenido del curso]
    N --> L[Estado local del navegador]
    N --> A[Supabase Auth]
    A --> P[(PostgreSQL con RLS)]
    N --> S[Supabase Storage]
    N --> R[Route Handlers y Server Actions]
```

- `src/app/(marketing)`: landing, privacidad, baja y captación.
- `src/app/(app)`: dashboard, cursos, módulos, lecciones, exámenes, calendario y cuenta.
- `src/app/api`: certificados y entrega del kit.
- `src/components`: interfaz y reproductores diferidos.
- `src/lib`: catálogo, progreso, autenticación, exámenes, SEO y acceso a datos.
- `course-content/ai-engineering`: paquetes fuente y flujo de integración del curso de AI Engineering.
- `supabase/migrations`: esquema PostgreSQL, índices, políticas RLS y datos iniciales.

## Persistencia y autenticación

### Visitantes

El curso puede recorrerse sin cuenta. El navegador conserva lecciones, módulos e intentos de examen en `localStorage`; el calendario y el laboratorio de reflexión también usan almacenamiento local. Estos datos pertenecen al navegador y dispositivo donde fueron creados.

### Cuentas

Supabase Auth gestiona registro, inicio de sesión y recuperación. Una cuenta puede importar el estado local y sincronizarlo en tablas PostgreSQL con políticas de seguridad por fila. Las claves públicas se usan en el cliente; las operaciones administrativas quedan reservadas al servidor.

### Estado de la integración

La autenticación y la importación/sincronización de progreso están implementadas. La arquitectura sigue siendo **híbrida**: el acceso visitante permanece local, el catálogo conserva soporte SQLite y la entrega de multimedia se está separando del repositorio mediante Supabase Storage. No se presenta como una migración total a backend remoto.

## AI Engineering Aplicado

El segundo curso está integrado al catálogo y a las rutas públicas con el slug `ai-engineering-aplicado`. Sus 12 módulos se preparan desde manifiestos y paquetes de contenido. Los scripts de gestión permiten validar, preparar e integrar un módulo; `predev`, `prebuild`, `prelint` y `pretest` regeneran la salida necesaria antes de cada proceso.

Comandos específicos:

```powershell
npm run content:validate:ai-engineering-module -- <ruta-del-modulo>
npm run content:prepare:ai-engineering-module -- <ruta-del-modulo>
npm run content:integrate:ai-engineering-module -- <ruta-del-modulo>
npm run content:prepare:ai-engineering
```

## Testing y calidad

### RAG fundamentado y tutor local

La capa server-only de RAG mantiene desacoplados embeddings, retrieval y generación. El modelo generador se configura con `GEMINI_RAG_MODEL`; la recomendación validada para la primera versión pública es `gemini-3.5-flash-lite`. `RAG_SIMILARITY_THRESHOLD` controla el corte de suficiencia antes de invocar al generador.

El valor inicial `0.700` es **experimental**: proviene de la evaluación controlada del corpus y no debe considerarse definitivo hasta probar consultas reales de estudiantes. Cuando el primer resultado queda por debajo del corte, el sistema devuelve `insufficient_evidence` sin solicitar una generación.

```powershell
npm run rag:evaluate:generation
```

La evaluación utiliza hasta cinco fragmentos y exige citas `[S#]` válidas. En desarrollo existe un tutor local en las páginas del curso y de cada módulo mediante `POST /api/assistant`. La ruta se deshabilita por defecto en producción; no incluye búsqueda web, historial ni streaming.

La protección de cuota del tutor se persiste en Supabase mediante operaciones atómicas compatibles con Vercel serverless. Los visitantes disponen por defecto de 5 consultas diarias y 2 por minuto; las cuentas autenticadas, de 20 diarias y 5 por minuto. Para visitantes se combina una cookie HTTP-only con la señal de red disponible y solo se conserva un HMAC server-side: nunca se almacena la IP en texto claro. `RAG_RATE_LIMIT_SECRET` debe ser un secreto independiente de al menos 32 caracteres.

`RAG_DAILY_GENERATION_BUDGET=400` reserva margen frente al cupo diario del generador y se descuenta únicamente justo antes de cada solicitud HTTP real a Gemini, incluidos reintentos. Las preguntas con evidencia insuficiente no consumen generación. `RAG_DAILY_EMBEDDING_BUDGET=450` añade un límite independiente para consultas vectoriales no cacheadas.

La caché server-only usa coincidencia exacta después de normalizar Unicode, mayúsculas y espacios. No persiste el texto de la pregunta: solo hashes y la respuesta pública validada. Su clave incluye curso, contexto de módulo, versión del corpus, modelo de embeddings, modelo generador, versión del prompt y configuración de retrieval; cambiar cualquiera de ellos invalida naturalmente las entradas anteriores. Los errores transitorios nunca se cachean.

Para comparar temporalmente otro generador sin cambiar `GEMINI_RAG_MODEL`, indica el modelo solo en el proceso del benchmark:

```powershell
$env:RAG_BENCHMARK_MODEL="gemini-3.5-flash-lite"
npm.cmd run rag:benchmark:generation
Remove-Item Env:RAG_BENCHMARK_MODEL
```

El benchmark comprueba el modelo con la SDK oficial, ejecuta las mismas 15 preguntas respondibles y 5 externas de Fase 4A, reutiliza retrieval, prompt y umbral del motor RAG y guarda un checkpoint completo separado por modelo. Cada generación se intenta una sola vez y se aplica una pausa conservadora de 10 segundos entre llamadas. La pausa puede ajustarse temporalmente con `RAG_BENCHMARK_DELAY_MS` sin modificar `.env.local`.

La suite cubre, entre otros aspectos, catálogo y rutas de AI Engineering, evaluaciones, estado local, autenticación, retorno seguro después del login, importación a Supabase, certificados, marketing y SEO.

```powershell
npm test
npm run lint
npm run build
```

## SEO y producción

- Metadatos, canonical y datos estructurados del curso.
- `sitemap.xml` y `robots.txt` generados por Next.js.
- Archivo de verificación de Google incluido en `public/`.
- URL canónica configurable con `NEXT_PUBLIC_APP_URL`.
- Despliegue público en Vercel.
- Rewrites de multimedia optimizada hacia Supabase Storage con caché inmutable.

El repositorio contiene la preparación técnica para Search Console; la indexación y el posicionamiento dependen también de la configuración y seguimiento del sitio publicado.

## Seguridad

- No subir `.env`, `.env.local`, bases SQLite ni credenciales.
- Nunca exponer `SUPABASE_SECRET_KEY` ni `GEMINI_API_KEY` con el prefijo `NEXT_PUBLIC_`.
- Mantener secretos de marketing y Resend exclusivamente en el servidor.
- Conservar las políticas RLS al modificar el esquema de Supabase.
- El kit se entrega con token firmado y no como archivo público directo.

## Decisiones técnicas

- **Next.js App Router:** reúne páginas públicas, aplicación y endpoints en un mismo proyecto tipado.
- **Acceso sin registro:** reduce la barrera de entrada y mantiene disponible el contenido educativo.
- **Progreso híbrido:** `localStorage` permite comenzar de inmediato; Supabase agrega continuidad entre sesiones para cuentas.
- **RLS en PostgreSQL:** limita la lectura y escritura de cada estudiante a sus propios datos.
- **Multimedia diferida:** evita montar recursos pesados hasta que la persona decide abrirlos.
- **Contenido basado en manifiestos:** hace verificable y repetible la incorporación de módulos de AI Engineering.

## Aprendizajes

Este proyecto permitió trabajar la evolución de un producto educativo desde una experiencia local hacia una arquitectura híbrida, además de practicar modelado de progreso, autenticación, control de acceso, generación de PDFs, pruebas automatizadas y entrega eficiente de contenido pesado.

## Estado actual

| Área | Estado |
| --- | --- |
| Plataforma y cursos | En producción |
| Acceso libre y progreso local | Terminado |
| Autenticación y sincronización con Supabase | Implementado |
| AI Engineering Aplicado, módulos 1–12 | Integrado |
| Separación de multimedia hacia Storage | En transición |
| Seguimiento de indexación en Search Console | Operativo fuera del código; requiere monitoreo |

No hay capturas de interfaz actuales dentro del repositorio. Se evita mostrar imágenes de contenido como si fueran capturas del producto.

## Desarrollo local

### Requisitos

- Node.js 20.9 o superior
- npm

### Instalación

```powershell
git clone https://github.com/juansebag31-blip/academia-ia-educativa.git
Set-Location academia-ia-educativa
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

Sin variables de Supabase, las funciones remotas no estarán disponibles, pero el proyecto conserva el recorrido local previsto para visitantes.

### Variables de entorno

Los nombres y su alcance están documentados en [`.env.example`](.env.example):

- públicas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`;
- privadas: `SUPABASE_SECRET_KEY`, `GEMINI_API_KEY`, `GEMINI_RAG_MODEL`, `RAG_SIMILARITY_THRESHOLD`, `RAG_RATE_LIMIT_SECRET`, límites y presupuestos `RAG_*`, `MARKETING_HASH_SECRET`, `MARKETING_DOWNLOAD_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.

### Scripts útiles

```powershell
npm run dev
npm run build
npm run lint
npm test
npm run db:seed
npm run content:import
npm run kit:generate
```

Las especificaciones y planes técnicos se conservan en `docs/superpowers/`.
