# Task Block 84 Status — Fase 11 Bloque 1

## Identificacion
- Bloque: `Bloque 1`
- Fase: `Fase 11`
- Tasks: `T-1100` a `T-1104`
- Estado: `CERRADO`
- Fecha de cierre: `2026-04-13`

## Design System: Meridian

### Direccion estetica
- **Concepto**: Precision con Autoridad Calida — ERP sofisticado, no startup SaaS
- **Tipografia**: DM Serif Display (display/titulos) + Outfit (body) + JetBrains Mono (datos)
- **Color primario**: Atlas Ink — Navy profundo OKLCH hue 231 (reemplaza azul generico hue 250)
- **Acento**: Atlas Amber — Dorado calido OKLCH hue 72
- **Neutrales**: Warm Gray con undertone sutil
- **Sombras**: Undertone navy en todos los niveles

## Tasks del bloque

| Task | Titulo | Estado |
|------|--------|--------|
| T-1100 | Definir tokens de color | CERRADA |
| T-1101 | Definir tokens de tipografia | CERRADA |
| T-1102 | Definir tokens de spacing | CERRADA |
| T-1103 | Definir tokens de radio/shadow | CERRADA |
| T-1104 | Definir semantica de colores de estados | CERRADA |

## Entregables

### `apps/web/index.html` (actualizado)
- Google Fonts: DM Serif Display, Outfit, JetBrains Mono (preconnect + link)

### `apps/web/src/assets/index.css` (reescrito completo)
- T-1100: Paleta raw — ink-* (hue 231), amber-* (hue 72), neutral-* (warm gray); brand-* aliases para backward-compat
- T-1101: --font-display/sans/mono; base layer con h1-h6 en DM Serif Display; .heading-display y .label-caps helpers
- T-1102: spacing semantico — page-x, section-y, card-x/y, form-gap, input-x/y, table-x/y
- T-1103: radios xs(3px) a full; sombras xs/sm/md/lg/xl/2xl con undertone navy; shadow-focus y shadow-focus-error; transiciones fast/base/slow/spring/gentle
- T-1104: Success/Error/Warning/Info con -subtle/-border/-on-* variants en OKLCH; Warning usa on-warning oscuro por contraste

### Componentes actualizados (primer pas de Meridian)
- `Badge.jsx`: 7 variantes (neutral/primary/success/error/warning/info/accent), prop dot, ring-inset para depth visual
- `Button.jsx`: 5 variantes (primary/secondary/ghost/danger/accent), 3 tamanos, iconLeft/iconRight, spinner refinado
- `Input.jsx`: leadingIcon/trailingIcon, error con icono SVG, shadow-focus ring semantico

## Validaciones
- pnpm --filter web lint: OK
- pnpm --filter web build: OK (177 modulos, 1.37s)
