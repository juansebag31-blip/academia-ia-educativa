# Plataforma gratuita - Fase 1

## Objetivo

Preparar Academia IA Educativa para evolucionar desde una aplicación local de un
solo usuario hacia una plataforma pública gratuita, sin modificar todavía el acceso
abierto al curso ni el comportamiento actual del estudiante.

## Decisión de acceso

- Todo el curso seguirá visible sin cuenta.
- El visitante conservará temporalmente su progreso en el navegador.
- El registro será opcional y servirá para sincronizar progreso, notas, exámenes y
  certificados.
- La importación del progreso anónimo se implementará después de completar el login.

## Alcance de esta fase

### Repositorio

- Crear un repositorio Git reproducible y apto para GitHub.
- Excluir bases SQLite, cachés, secretos y los 1,2 GB de recursos multimedia.
- Mantener todos los archivos excluidos en el equipo local; no se eliminarán.
- Documentar instalación, ejecución y arquitectura.

### Configuración

- Crear `.env.example` únicamente con nombres de variables.
- Añadir validación centralizada de la configuración pública de Supabase.
- Permitir que el curso siga arrancando sin credenciales durante la transición.

### Supabase

- Preparar la estructura local del proyecto Supabase.
- Crear una migración PostgreSQL inicial.
- Diseñar perfiles, matrículas, progreso, actividades, notas, exámenes y certificados.
- Activar RLS en todas las tablas expuestas.
- Permitir lectura pública del catálogo publicado.
- Restringir datos personales al usuario propietario.
- Reservar el rol administrador en `app_metadata`, nunca en metadatos editables.

## Fuera de alcance

- Pantallas de registro y login.
- Creación de usuarios reales.
- Sincronización efectiva del progreso.
- Migración de los archivos multimedia.
- Despliegue en Vercel.
- Dominio personalizado.
- Pagos o suscripciones.

## Arquitectura de datos

### Catálogo público

- `courses`
- `modules`
- `lessons`
- `resources`

Solo se podrán leer registros marcados como publicados.

### Datos privados

- `profiles`
- `enrollments`
- `lesson_progress`
- `learning_states`
- `student_notes`
- `exam_attempts`
- `certificates`

Cada fila privada estará asociada a `auth.users.id`. Las políticas permitirán que un
usuario autenticado consulte o modifique únicamente sus propios datos.

## Estrategia de transición

La base SQLite seguirá siendo la fuente local durante esta fase. La migración a
Supabase se realizará después de crear y conectar un proyecto específico para el
curso. Esto evita interrumpir la aplicación mientras se prepara la infraestructura.

## Criterios de aceptación

- El repositorio no incluye secretos, bases locales ni recursos pesados.
- Existe documentación suficiente para instalar y ejecutar el proyecto.
- La migración SQL activa RLS y define políticas explícitas.
- La configuración de Supabase se puede validar mediante pruebas.
- El curso sigue compilando y sus pruebas existentes continúan pasando.
