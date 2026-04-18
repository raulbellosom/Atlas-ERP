# Frontend Master Prompt

## ID de task origen

- `T-0114`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Instrucción

Construye el frontend web de AtlasERP con React + JavaScript + TailwindCSS 4.1. La app vive en `apps/web` y usa componentes de `packages/ui`.

### Stack

- React (JavaScript, no TypeScript).
- Vite como bundler.
- TailwindCSS 4.1 como sistema de estilos.
- Radix UI Primitives como base de componentes interactivos.
- Lucide o Phosphor para iconografía.
- React Router para navegación.
- React Query (TanStack Query) para estado de servidor.
- No usar Bootstrap.

### Estructura

- Carpetas por módulos de negocio dentro de `apps/web/src/modules/`.
- Componentes reutilizables en `packages/ui`.
- Servicios de API en capa separada.
- Hooks personalizados para lógica reutilizable.
- Guards de rutas para protección por auth y permisos.

### Estados UX obligatorios

Toda pantalla importante debe soportar:

- **Loading**: skeleton loaders o spinners apropiados.
- **Empty**: mensaje claro y acción sugerida.
- **Error**: mensaje legible con opción de reintentar.
- **Offline**: indicador visual de modo offline.
- **Sync pending**: indicador de cambios pendientes de sincronizar.

### Convenciones

- Naming de componentes: `docs/02-architecture/05-naming-componentes-ui.md`.
- Naming de rutas: `docs/04-modules/04-nomenclatura-rutas-frontend.md`.
- Formularios con validaciones claras.
- Tablas con paginación, filtros y ordenamiento.
- Modales y paneles laterales para operaciones contextuales.
- Error boundaries en puntos críticos.
- Toasts/notificaciones para feedback de acciones.

### Restricciones

- No usar Bootstrap ni CSS frameworks adicionales.
- No mezclar lógica de sync compleja en componentes visuales.
- Diseño profesional, moderno, limpio y consistente.
- Responsive mobile-first en toda pantalla (ver `responsive-layout-skill.md`).
- Respetar permisos visuales por módulo y acción.

### Referencia

- `docs/00-canon/05_ui_principles.md`
- `docs/02-architecture/05-naming-componentes-ui.md`
- `docs/04-modules/04-nomenclatura-rutas-frontend.md`
- `docs/08-codex/skills/frontend-screen-skill.md`
- `docs/08-codex/skills/radix-component-skill.md`
- `docs/08-codex/skills/responsive-layout-skill.md`
