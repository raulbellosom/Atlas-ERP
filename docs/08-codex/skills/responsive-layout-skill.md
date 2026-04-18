# Responsive Layout Skill

## ID de task origen

- `T-1118`
- Estado: `aprobada`
- Fecha: `2026-04-14`

## Objetivo

Guiar la implementación de layouts responsive mobile-first en AtlasERP, asegurando que toda pantalla funcione desde 375px hasta 1440px+ con una experiencia profesional en cada breakpoint.

## Principios

### Mobile-first obligatorio

TODOS los estilos base se escriben para mobile. Se amplían con breakpoints:

```jsx
// ✅ Mobile-first — base es mobile, md: es desktop
className="flex flex-col gap-4 md:flex-row md:gap-6"

// ❌ Desktop-first — esto está prohibido
className="flex flex-row gap-6 max-md:flex-col max-md:gap-4"
```

### Breakpoints oficiales

| Token | Ancho mínimo | Dispositivo típico |
|---|---|---|
| (base) | 0px | iPhone SE, Android small |
| `sm:` | 640px | iPhone landscape, Android medium |
| `md:` | 768px | iPad portrait, tablets |
| `lg:` | 1024px | iPad landscape, laptops |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Monitores grandes |

### Unidades responsive

- **Width**: usar `w-full` base + `md:max-w-*` para limitar
- **Height**: preferir `min-h-dvh` sobre `h-screen` (viewport dinámico en mobile)
- **Padding de página**: `px-4 md:px-6 lg:px-(--spacing-page-x)`
- **Gaps**: escalar con breakpoints `gap-3 md:gap-4 lg:gap-6`

## Patrones de layout

### 1. AppShell (layout principal)

```
Mobile:
┌────────────────────────┐
│ Header (sticky)        │
├────────────────────────┤
│ Main content           │
│ (full-width)           │
│                        │
├────────────────────────┤
│ Bottom nav (fixed)     │
└────────────────────────┘

Desktop (lg:):
┌──────┬─────────────────┐
│ Side │ Header           │
│ bar  ├─────────────────┤
│      │ Main content     │
│ (w-  │ (con padding)    │
│ 64)  │                  │
│      │                  │
└──────┴─────────────────┘
```

### 2. Stacked → Grid

```jsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  <Card />
  <Card />
  <Card />
</div>
```

### 3. Tablas responsive

- Mobile: tabla se convierte en cards stacked o scroll horizontal
- Desktop: tabla completa

```jsx
<div className="overflow-x-auto -mx-4 md:mx-0 md:overflow-visible">
  <Table ... />
</div>
```

### 4. Formularios responsive

```jsx
<form className="grid grid-cols-1 gap-(--spacing-form-gap) md:grid-cols-2">
  <Input label="Nombre" /> {/* ocupa 1 col */}
  <Input label="Email" />  {/* ocupa 1 col */}
  <Textarea label="Descripción" className="md:col-span-2" /> {/* full width */}
</form>
```

### 5. Modales y paneles

- **Modal**: full-screen en mobile, centrado con max-width en desktop
- **SidePanel**: full-width en mobile, anchura fija desde la derecha en desktop
- **AlertDialog**: siempre centrado, más compacto

### 6. Sidebar navigation

```jsx
// Mobile: drawer overlay (Radix Dialog)
// Desktop: sidebar fija con estado collapsed/expanded
<aside className="
  fixed inset-y-0 left-0 z-40 w-64
  -translate-x-full lg:translate-x-0
  transition-transform
">
```

## Validación responsive

Toda pantalla se valida en 4 viewports:
1. **375px** — iPhone SE (mobile base)
2. **768px** — iPad portrait (tablet)
3. **1024px** — iPad landscape / laptop
4. **1440px** — Desktop full

## Referencia

- `apps/web/src/assets/index.css` — spacing tokens
- `docs/00-canon/05_ui_principles.md`
- `docs/08-codex/skills/radix-component-skill.md`
