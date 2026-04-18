# T-0804 - Configurar estructura modular del frontend

## Metadatos
- ID: `T-0804`
- Fase: `Fase 8`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Objetivo
Implementar la estructura de directorios modular del frontend con sus primeros archivos reales (layouts, store, cliente HTTP, páginas base).

## Alcance
- `src/components/layout/`:
  - `PublicLayout.jsx` — centrado vertical, fondo neutro, Outlet.
  - `PrivateLayout.jsx` — Sidebar + TopBar + main con Outlet.
  - `Sidebar.jsx` — navegación principal con NavLink activo.
  - `TopBar.jsx` — barra superior con email y logout.
  - `RequireAuth.jsx` — guard de rutas privadas con redirect a /login.
- `src/store/auth.store.js` — Zustand + persist: estado de sesión (user, accessToken, isAuthenticated), login(), logout(), setToken().
- `src/api/client.js` — Axios con interceptors: Authorization header (lee de localStorage), normalización de errores de API.
- `src/pages/auth/LoginPage.jsx` — formulario de login con manejo de estado y error.
- `src/pages/dashboard/DashboardPage.jsx` — shell de dashboard con grid de placeholders.
- `src/pages/NotFoundPage.jsx` — página 404 con link de vuelta.
- `src/config/env.js` — añadido `defaultOrgId` (VITE_DEFAULT_ORG_ID).
- `apps/web/.env` y `.env.example` — variables de entorno de desarrollo.

## Resultados
- Estructura modular completa con 10+ archivos reales.
- Login page funcional (conecta con backend, guarda token en localStorage).
- Guard RequireAuth redirige a /login si no hay sesión.

## Criterios de aceptacion
- [x] Layouts separados (public/private).
- [x] RequireAuth guard operativo.
- [x] Zustand store con persist.
- [x] Axios client con Authorization interceptor.
- [x] login + build + lint OK.

## Fuera de alcance
- i18n (T-0824).
- Manejo de refresh tokens (T-0809).
- Toasts/notifications (T-0817).
