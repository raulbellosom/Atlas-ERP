# Radix Component Skill

## ID de task origen

- `T-1110` a `T-1124`
- Estado: `aprobada`
- Fecha: `2026-04-14`

## Objetivo

Estandarizar la construcción de componentes UI de AtlasERP sobre primitivos de Radix UI, garantizando accesibilidad nativa, responsive mobile-first y consistencia visual con el Design System Meridian.

## Stack

- **Radix UI Primitives**: headless, accesibles, composables
- **TailwindCSS 4.1**: estilos via clases utilitarias + tokens Meridian
- **Animaciones**: CSS `@keyframes` activadas por atributos `data-[state]` de Radix
- **React 19 + JavaScript** (no TypeScript)
- **Lucide** para iconografía

## Procedimiento

### 1. Importar el primitivo Radix

```jsx
import * as Dialog from "@radix-ui/react-dialog";
```

No importar estilos de Radix — los componentes son headless.

### 2. Wrappear con estilos Meridian

Cada sub-componente Radix se envuelve con clases TailwindCSS que usan los design tokens Meridian definidos en `apps/web/src/assets/index.css`.

```jsx
<Dialog.Overlay className="fixed inset-0 bg-surface-overlay backdrop-blur-sm data-[state=open]:animate-atlas-in" />
```

### 3. Usar `data-[state]` para animaciones

Radix inyecta `data-state="open"` y `data-state="closed"` automáticamente. Usar esto para animar entrada/salida:

```css
/* Las animaciones atlas-in / atlas-out ya existen en index.css */
.data-[state=open]:animate-atlas-in { ... }
```

### 4. Responsive mobile-first

Escribir estilos base para mobile, ampliar con breakpoints:

```jsx
className="w-full h-dvh md:max-w-lg md:h-auto md:rounded-xl"
```

**Breakpoints oficiales:**
| Token | Ancho | Uso típico |
|---|---|---|
| (base) | 0–639px | Teléfonos — stacked, full-width |
| `sm:` | 640px+ | Teléfonos landscape |
| `md:` | 768px+ | Tablets portrait |
| `lg:` | 1024px+ | Tablets landscape, laptops |
| `xl:` | 1280px+ | Desktop |

### 5. Exportar con API limpia

El componente exportado debe ocultar la complejidad de Radix y exponer una API simple:

```jsx
export default function Modal({ open, onClose, title, children, footer, size }) { ... }
```

Mantener retrocompatibilidad con las props existentes siempre que sea posible.

### 6. Checklist obligatorio por componente

- [ ] Usa primitivo Radix (no hand-crafted)
- [ ] Estilos con tokens Meridian (no colores genéricos de Tailwind)
- [ ] Animación de entrada/salida con `data-[state]`
- [ ] Responsive: funciona en 375px (mobile) hasta 1440px (desktop)
- [ ] Keyboard navigation funcional (heredado de Radix)
- [ ] `aria-*` correctos (heredado de Radix)
- [ ] Focus visible con `shadow-focus` token
- [ ] JSDoc con descripción y params
- [ ] Export default o named según convención del componente

### 7. Colores — usar tokens semánticos, no genéricos

```jsx
// ✅ Correcto — usa token Meridian
className="bg-surface border-border text-text-primary"

// ❌ Incorrecto — usa color genérico Tailwind
className="bg-white border-gray-200 text-gray-900"
```

Variantes de estado semántico:

```jsx
const VARIANT_STYLES = {
  success: "bg-success-subtle border-success-border text-success",
  error:   "bg-error-subtle border-error-border text-error",
  warning: "bg-warning-subtle border-warning-border text-warning",
  info:    "bg-info-subtle border-info-border text-info",
};
```

## Referencia

- `apps/web/src/assets/index.css` — tokens Meridian
- `docs/00-canon/05_ui_principles.md`
- `docs/02-architecture/05-naming-componentes-ui.md`
- `docs/08-codex/agents/design-system-agent.md`
