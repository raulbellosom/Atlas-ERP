# Catálogo de Componentes — Design System Meridian v1.0

> Design System del ERP AtlasERP, identidad «El Compás del Navegante».
> Construido sobre **Radix UI Primitives** + **TailwindCSS 4.1** + tokens OKLCH.

## Paleta de identidad

| Token | Rol | Valor |
|---|---|---|
| `ink-*` | Primario — autoridad navy | OKLCH hue 231 |
| `amber-*` | Acento — latón del compás | OKLCH hue 72 |
| `neutral-*` | Neutro — gris cálido | OKLCH hue 250, chroma mínimo |
| `surface-*` | Superficies semánticas | Derivados de neutrales/ink |
| `success/error/warning/info` | Estados | Semánticos OKLCH |

## Tipografía

| Token | Fuente | Uso |
|---|---|---|
| `--font-display` | DM Serif Display | Títulos de sección, headings |
| `--font-sans` | Outfit | Body, labels, UI general |
| `--font-mono` | JetBrains Mono | Datos financieros, IDs, código |

---

## Componentes — Radix UI (11)

### Modal
- **Archivo**: `components/ui/Modal.jsx`
- **Primitivo**: `@radix-ui/react-dialog`
- **Props**: `open`, `onClose`, `title`, `description`, `children`, `footer`, `size`(`sm|md|lg|xl`), `closeOnOverlay`
- **Responsive**: Full-screen en mobile, centrado con max-width en desktop
- **Animación**: `atlas-overlay-in/out`, `atlas-content-in/out`
- **Identidad**: Bordes con `border-border`, overlay con `bg-surface-overlay`

### SidePanel (Sheet)
- **Archivo**: `components/ui/SidePanel.jsx`
- **Primitivo**: `@radix-ui/react-dialog`
- **Props**: `open`, `onClose`, `title`, `description`, `children`, `footer`, `size`(`sm|md|lg`), `closeOnOverlay`
- **Responsive**: Full-width en mobile, anchura configurable en desktop
- **Animación**: `atlas-slide-in/out-right`

### Select
- **Archivo**: `components/ui/Select.jsx`
- **Primitivo**: `@radix-ui/react-select`
- **Props**: `label`, `error`, `helpText`, `placeholder`, `options`, `groups`, `value`, `onValueChange`, `required`, `disabled`
- **Responsive**: Auto-adapta al contenedor
- **Animación**: `atlas-in/out`
- **Identidad**: Check indicator en `ink-600`, hover en `ink-50`

### Toast
- **Archivo**: `components/ui/Toast.jsx`
- **Primitivo**: `@radix-ui/react-toast`
- **Props**: Provider + hook `useToast()` → `toast.success/error/info/warning(message, opts)`
- **Responsive**: Posicionado bottom-right, ancho adaptable
- **Animación**: `atlas-toast-in/out`, swipe-to-dismiss
- **Identidad**: Variantes con tokens semánticos Meridian (no genéricos)

### Tabs
- **Archivo**: `components/ui/Tabs.jsx`
- **Primitivo**: `@radix-ui/react-tabs`
- **Props**: `tabs`, `defaultValue`, `value`, `onValueChange`, `variant`(`line|pills`), `children`
- **Sub**: `TabContent` (`value`, `children`)
- **Responsive**: Scroll horizontal en mobile
- **Identidad**: Indicador `ink-600`, activo `ink-700`

### Tooltip
- **Archivo**: `components/ui/Tooltip.jsx`
- **Primitivo**: `@radix-ui/react-tooltip`
- **Props**: `content`, `children`, `side`, `delayDuration`
- **Provider**: `TooltipProvider` en root
- **Identidad**: Fondo `ink-900`, texto `text-inverse`, flecha ink

### DropdownMenu
- **Archivo**: `components/ui/DropdownMenu.jsx`
- **Primitivo**: `@radix-ui/react-dropdown-menu`
- **Props**: `trigger`, `children`, `align`, `sideOffset`
- **Sub**: `DropdownMenuItem`(`variant`, `icon`), `DropdownMenuSeparator`, `DropdownMenuLabel`
- **Identidad**: Destructive en `text-error`, hover en `ink-50`

### AlertDialog
- **Archivo**: `components/ui/AlertDialog.jsx`
- **Primitivo**: `@radix-ui/react-alert-dialog`
- **Props**: `open`, `onOpenChange`, `title`, `description`, `cancelLabel`, `confirmLabel`, `onConfirm`, `variant`(`destructive|default`)
- **Responsive**: Centrado responsive, botones stacked en mobile
- **Identidad**: Destructive `bg-error`, default `bg-ink-600`

### Checkbox
- **Archivo**: `components/ui/Checkbox.jsx`
- **Primitivo**: `@radix-ui/react-checkbox`
- **Props**: `label`, `checked`(`boolean|'indeterminate'`), `onCheckedChange`, `disabled`
- **Identidad**: Checked/indeterminate `bg-ink-600`, SVG checkmark/dash propios

### Switch
- **Archivo**: `components/ui/Switch.jsx`
- **Primitivo**: `@radix-ui/react-switch`
- **Props**: `label`, `checked`, `onCheckedChange`, `disabled`, `size`(`sm|md`)
- **Identidad**: On `bg-ink-600`, off `bg-neutral-300`

### ScrollArea
- **Archivo**: `components/ui/ScrollArea.jsx`
- **Primitivo**: `@radix-ui/react-scroll-area`
- **Props**: `children`, `className`, `orientation`(`vertical|horizontal|both`)
- **Identidad**: Scrollbar con `bg-border-strong`, hover `bg-neutral-400`

---

## Componentes — Base (15)

| Componente | Archivo | Descripción |
|---|---|---|
| Badge | `Badge.jsx` | Etiquetas xs/sm con variantes de estado y territorio |
| Breadcrumbs | `Breadcrumbs.jsx` | Navegación jerárquica |
| Button | `Button.jsx` | Botones primary/secondary/ghost/destructive, xs a lg |
| Card | `Card.jsx` | Contenedor con CardHeader + CardBody |
| EmptyState | `EmptyState.jsx` | Estado vacío con icono y acción sugerida |
| ErrorBoundary | `ErrorBoundary.jsx` | Catch de errores React |
| Icon | `Icon.jsx` | Wrapper para iconos SVG |
| Input | `Input.jsx` | Input con label, error, helpText, icons |
| OfflineBanner | `OfflineBanner.jsx` | Banner de modo offline |
| PermissionGate | `PermissionGate.jsx` | Renderizado condicional por permisos |
| SearchInput | `SearchInput.jsx` | Input de búsqueda con debounce |
| Skeleton | `Skeleton.jsx` | Loading placeholder + TableRowSkeleton + CardSkeleton |
| Spinner | `Spinner.jsx` | Spinner de carga circular |
| Table | `Table.jsx` | Tabla con sort, selección, sticky header, empty cartográfico |
| Textarea | `Textarea.jsx` | Textarea con label, error, helpText |

---

## Layout Responsive

| Componente | Archivo | Descripción |
|---|---|---|
| PrivateLayout | `layout/PrivateLayout.jsx` | AppShell: sidebar + topbar + main, responsive mobile-first |
| Sidebar | `layout/Sidebar.jsx` | Desktop: fija w-60 ink-950 / Mobile: drawer Radix Dialog |
| TopBar | `layout/TopBar.jsx` | Header con hamburguesa mobile, usuario, conexión |
| ConnectionIndicator | `layout/ConnectionIndicator.jsx` | Dot success/warning con Tooltip Radix |

### Breakpoints

| Viewport | Behavior |
|---|---|
| < 640px (mobile) | Sidebar oculta (drawer), TopBar con ☰, contenido full-width px-4 |
| 768px (tablet) | Contenido px-6, email visible |
| 1024px+ (desktop) | Sidebar fija w-60, contenido px-8 max-w-7xl |

---

## Animaciones Meridian

| Nombre | Uso | Duración |
|---|---|---|
| `atlas-in/out` | Dropdowns, popovers | 140/100ms |
| `atlas-overlay-in/out` | Overlays de modal/dialog | 200/150ms |
| `atlas-content-in/out` | Contenido de modal | 200/150ms |
| `atlas-slide-in/out-right` | SidePanel | 250/200ms |
| `atlas-slide-in/out-left` | Mobile sidebar drawer | 250/200ms |
| `atlas-toast-in/out` | Toasts | 250/200ms |
| `atlas-toast-swipe-out` | Swipe dismiss | 150ms |
| `atlas-tooltip-in/out` | Tooltips | 120/80ms |
