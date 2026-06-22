# Academia IA Educativa

Plataforma educativa gratuita para aprender fundamentos de inteligencia artificial,
uso responsable de herramientas y aprendizaje activo con NotebookLM.

## Estado del proyecto

La aplicación contiene:

- 11 módulos y 33 lecciones;
- videos, audios, documentos e infografías;
- rutas de aprendizaje interactivas;
- cuestionarios, exámenes y certificados;
- progreso local para visitantes;
- diseño responsive.

La plataforma está en transición hacia Supabase para ofrecer cuentas gratuitas y
sincronización del progreso. Todo el curso seguirá siendo accesible sin registro.

## Tecnologías

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Vitest
- Supabase Auth y PostgreSQL, en integración
- Vercel, despliegue previsto

## Desarrollo local

Requisitos:

- Node.js 20.9 o superior
- npm

Instalación:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

Mientras no se hayan configurado las variables de Supabase, la aplicación continúa
utilizando la base SQLite local y el progreso del navegador.

## Verificación

```powershell
npm test
npm run lint
npm run build
```

## Variables de entorno

Los nombres requeridos están documentados en `.env.example`.

## Acceso gratuito y cuentas

Todo el curso permanece disponible sin iniciar sesión. El visitante conserva
su progreso en `localStorage`. Las cuentas gratuitas usan Supabase Auth para
sincronizar lecciones, actividades y exámenes desde `/account`.

Rutas principales:

- `/` - landing pública optimizada para buscadores;
- `/dashboard` - panel principal del curso;
- `/auth/register`
- `/auth/login`
- `/auth/forgot-password`
- `/auth/update-password`
- `/account`

## Landing, SEO y captación

La portada pública presenta el curso a docentes y estudiantes, enlaza el contenido real y ofrece un kit gratuito de prompts. El formulario necesita las variables privadas documentadas en `.env.example` y la migración `20260622190000_marketing_subscribers.sql` aplicada en Supabase.

Regenerar el kit descargable:

```powershell
npm run kit:generate
```

El PDF final queda en `output/pdf/kit-prompts-ia-educativa.pdf`. La API lo entrega únicamente mediante un enlace firmado; no se publica dentro de `public/`.

Resend es opcional. Sin `RESEND_API_KEY` y `RESEND_FROM_EMAIL`, una suscripción válida habilita la descarga en pantalla, pero no envía correo.

Después del despliegue:

1. confirmar que `NEXT_PUBLIC_APP_URL` contiene la URL canónica definitiva;
2. abrir `/sitemap.xml` y `/robots.txt`;
3. registrar el sitio en Google Search Console;
4. enviar la URL del sitemap;
5. verificar indexación, clics al curso, suscripciones y descargas.

La configuración técnica facilita el rastreo y la indexación, pero no garantiza una posición concreta en buscadores.

Nunca deben subirse:

- `.env` o `.env.local`;
- claves `service_role`;
- bases SQLite;
- credenciales de proveedores.

## Recursos multimedia

Los recursos generados del curso ocupan aproximadamente 1,2 GB y permanecen en:

```text
public/course-assets/
```

La carpeta está excluida de Git. En producción, estos recursos se trasladarán a un
servicio de almacenamiento y sus URLs se registrarán en PostgreSQL.

## Modelo de acceso

- Visitante: puede recorrer todo el curso sin cuenta.
- Estudiante registrado: podrá sincronizar progreso, notas, exámenes y certificados.
- Administrador: gestionará usuarios y contenido publicado.

## Documentación

Las decisiones y planes técnicos están en:

```text
docs/superpowers/specs/
docs/superpowers/plans/
```
