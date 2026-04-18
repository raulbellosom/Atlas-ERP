# T-0324 - Crear estructura de carpetas oficial del frontend

## Metadatos
- ID: `T-0324`
- Fase: `Fase 3`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Crear la estructura de directorios oficial de `apps/web/src/` siguiendo el blueprint técnico del frontend (React + Vite + JavaScript), con `main.jsx` y `App.jsx` como entry points.

## Criterios de aceptación
- [x] `apps/web/src/main.jsx` — entry point React con ReactDOM.createRoot.
- [x] `apps/web/src/App.jsx` — root component (stub, routing se configura en Fase 6).
- [x] `apps/web/src/assets/index.css` — CSS global con directivas TailwindCSS.
- [x] `apps/web/src/modules/` — feature modules (auth, sales, sync-center, etc.).
- [x] `apps/web/src/pages/` — componentes de página (route-level).
- [x] `apps/web/src/components/ui/` — componentes UI reutilizables (botones, inputs, modales).
- [x] `apps/web/src/components/layout/` — layout components (Sidebar, Topbar, MainLayout).
- [x] `apps/web/src/hooks/` — custom React hooks.
- [x] `apps/web/src/api/` — cliente HTTP y funciones de llamada a la API.
- [x] `apps/web/src/store/` — estado global (Zustand/Jotai — se decide en Fase 6).
- [x] `apps/web/src/lib/` — utilidades, helpers, formatters.

## Estructura creada

```
apps/web/src/
  main.jsx                        Entry point React
  App.jsx                         Root component
  assets/
    index.css                     CSS global + Tailwind
  modules/                        Feature modules (por dominio)
  pages/                          Paginas a nivel de ruta
  components/
    ui/                           Componentes reutilizables
    layout/                       Layout components
  hooks/                          Custom hooks
  api/                            Llamadas a la API
  store/                          Estado global
  lib/                            Utilidades y helpers
```

## Archivos creados
- `apps/web/src/main.jsx`
- `apps/web/src/App.jsx`
- `apps/web/src/assets/index.css`
- `.gitkeep` en cada directorio vacío

## Decisiones técnicas
- **JavaScript, no TypeScript**: Canon del proyecto para `apps/web`. Más rapido de iterar en UI.
- **`modules/` para features**: Cada modulo de negocio tiene su carpeta con pages, hooks y API calls propias.
- **`components/ui/` vs `@atlasrep/ui`**: `ui/` es para componentes locales de la app. El package `@atlasrep/ui` es para componentes verdaderamente reutilizables entre apps.
- **`store/`**: El estado manager se elige en Fase 6. La estructura es agnóstica.
- **`api/`**: Centraliza todas las llamadas HTTP. Usa el `@atlasrep/sdk` como cliente base.
- **TailwindCSS en `index.css`**: Las directivas `@tailwind` se configuran en Fase 6 junto con el plugin de Vite.

## Pendientes no resueltos
- Router (React Router / TanStack Router), store manager y setup de TailwindCSS se configuran en Fase 6.
