# Autenticación y progreso híbrido

## Objetivo

Mantener el curso completo disponible sin cuenta y añadir registro gratuito,
inicio de sesión, recuperación de contraseña y sincronización del aprendizaje
para usuarios autenticados.

## Modelo de acceso

- Un visitante puede navegar todo el curso y completar actividades.
- Su progreso, notas, estados de aprendizaje y exámenes se guardan en su
  navegador.
- Una cuenta confirmada guarda esos datos en Supabase y los recupera en otros
  dispositivos.
- Después del primer inicio de sesión con datos locales, la interfaz ofrece
  importar el progreso visitante. La importación requiere una acción explícita
  y no elimina el contenido local hasta finalizar correctamente.

## Arquitectura

- Supabase Auth administra correo, contraseña, sesión y recuperación.
- `@supabase/ssr` mantiene la sesión en cookies para Server Components.
- Un `middleware.ts` actualiza la sesión, pero no protege las rutas educativas.
- El encabezado muestra sesión real y accesos a registro, login, cuenta y
  cierre de sesión.
- Un almacén local versionado representa el estado anónimo.
- Un servicio de sincronización convierte slugs locales en identificadores de
  Supabase y realiza `upsert` bajo las políticas RLS del usuario.

## Seguridad

- La clave pública es la única clave disponible en el navegador.
- No se usa `service_role` en componentes ni acciones públicas.
- La identidad se valida con `getUser()` en operaciones del servidor.
- El curso sigue siendo público; solo los datos personales requieren sesión.
- La recuperación usa un enlace de un solo uso y una pantalla separada para
  establecer la nueva contraseña.

## Compatibilidad

- El contenido y las rutas actuales no cambian.
- SQLite permanece temporalmente como fuente local de contenido, no como
  almacén de progreso por usuario en producción.
- Las actividades ya guardadas en `localStorage` se incorporan al paquete de
  importación.

## Criterios de aceptación

- Registro, confirmación, login, logout y recuperación funcionan.
- Un visitante nunca es obligado a registrarse.
- El progreso visitante es independiente por navegador.
- Un usuario puede importar sus datos locales una sola vez o descartarlos.
- Después de importar, los datos aparecen en las tablas protegidas por RLS.
- Tests, lint y build continúan pasando.
