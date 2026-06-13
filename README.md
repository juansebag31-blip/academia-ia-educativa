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
