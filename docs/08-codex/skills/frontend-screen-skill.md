# Frontend Screen Skill

## ID de task origen

- `T-0125`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Guiar la creación de pantallas frontend en AtlasERP con estados UX completos y estructura consistente.

## Procedimiento

### 1. Estados obligatorios

Toda pantalla debe incluir:

- **Loading state**: skeleton loaders o spinners apropiados al contenido.
- **Empty state**: mensaje claro con icono y acción sugerida (ej: "No hay movimientos. Crea el primero.").
- **Error state**: mensaje legible, sin datos técnicos expuestos, con botón de reintentar.
- **Offline state**: indicador visual de modo offline y acciones disponibles/restringidas.
- **Sync pending state**: indicador de cambios locales pendientes de sincronizar.

### 2. Estructura de página

```
pages/
  RecursoListPage.jsx      → listado con filtros, paginación, acciones.
  RecursoDetailPage.jsx    → detalle con tabs, acciones contextuales.
  RecursoCreatePage.jsx    → formulario de creación.
  RecursoEditPage.jsx      → formulario de edición.
```

### 3. Componentes de página

- Header con título, breadcrumbs y acciones principales.
- Filtros (si es listado).
- Tabla o grid de datos.
- Paginación.
- Modales para confirmaciones o acciones rápidas.
- Paneles laterales para detalles contextuales.

### 4. Stack

- React + JavaScript.
- TailwindCSS 4.1 para estilos.
- Lucide o Phosphor para iconos.
- React Query para datos del servidor.
- Componentes base de `packages/ui`.

### 5. Validaciones

- Verificar que todos los 5 estados UX están implementados.
- Verificar que los permisos visuales están aplicados.
- Verificar accesibilidad básica (labels, contraste, foco).
- Verificar responsive en breakpoints principales.

## Referencia

- `docs/00-canon/05_ui_principles.md`
- `docs/02-architecture/05-naming-componentes-ui.md`
- `docs/04-modules/04-nomenclatura-rutas-frontend.md`
