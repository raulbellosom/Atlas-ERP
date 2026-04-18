# T-0810 - Configurar guards de rutas

## Metadatos
- ID: `T-0810`
- Fase: `Fase 8`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Objetivo
Implementar guards de rutas para proteger rutas privadas y evitar que usuarios autenticados accedan a páginas públicas.

## Alcance
- `RequireAuth.jsx` (implementado en Bloque 1): redirige a `/login` si no hay sesión activa. Usa `useAuthStore(s => s.isAuthenticated)`.
- `AlreadyAuth.jsx` (nuevo en Bloque 3): redirige a `/dashboard` si ya hay sesión activa. Envuelve las rutas públicas (ej. `/login`).
- `App.jsx` actualizado: rutas públicas envueltas en `<AlreadyAuth>`, rutas privadas en `<RequireAuth>`.

## Criterios de aceptacion
- [x] Usuario no autenticado en ruta privada → redirect /login.
- [x] Usuario autenticado en /login → redirect /dashboard.
- [x] lint + build OK.
