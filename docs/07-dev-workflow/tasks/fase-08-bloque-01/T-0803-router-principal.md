# T-0803 - Configurar router principal

## Metadatos
- ID: `T-0803`
- Fase: `Fase 8`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Objetivo
Configurar React Router v7 como router principal con rutas públicas y privadas, lazy loading y redirección raíz.

## Alcance
- Actualizar `apps/web/src/App.jsx`:
  - `BrowserRouter` + `Routes` + `Route` de react-router-dom@7.
  - `QueryClientProvider` de @tanstack/react-query.
  - Lazy loading de páginas con `lazy()` + `Suspense`.
  - Rutas públicas: `/login` (PublicLayout).
  - Rutas privadas: `/dashboard` (RequireAuth → PrivateLayout).
  - Redireccion raíz `/` → `/dashboard`.
  - Ruta 404 `*` → NotFoundPage.
  - `PageLoader` spinner mientras se carga el chunk lazy.

## Resultados
- App renderiza el router con 3 routes funcionando (login, dashboard, 404).
- Lazy loading genera chunks separados: LoginPage, DashboardPage, NotFoundPage.

## Criterios de aceptacion
- [x] BrowserRouter configurado.
- [x] Rutas públicas y privadas separadas.
- [x] Lazy loading con Suspense.
- [x] Build genera chunks por página.
- [x] lint + build OK.
