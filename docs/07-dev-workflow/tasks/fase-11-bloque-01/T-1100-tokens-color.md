# T-1100 - Definir tokens de color

## Metadatos
- ID: `T-1100`
- Fase: `Fase 11`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendDesignAgent`

## Alcance
`apps/web/src/assets/index.css` — paleta raw completa en @theme:

### Paletas definidas
- **Atlas Ink** (`--color-ink-50` a `--color-ink-950`): Navy profundo OKLCH hue 231. El tono primario de autoridad de AtlasERP.
- **Atlas Amber** (`--color-amber-50` a `--color-amber-950`): Acento dorado calido OKLCH hue 72. Evoca confianza financiera.
- **Neutral** (`--color-neutral-50` a `--color-neutral-950`): Gris calido OKLCH hue 250 con chroma minimo. No frio.
- **brand-*** aliases: --color-brand-* apuntan a valores identicos a ink-* para backward-compat de componentes existentes.

### Tokens semanticos de superficie y borde
- surface, surface-subtle, surface-raised, surface-sunken, surface-overlay
- border, border-subtle, border-strong, border-focus
- text-primary, text-secondary, text-disabled, text-inverse, text-accent

## Criterios de aceptacion
- [x] 11 pasos por paleta (50 a 950) en OKLCH.
- [x] brand-* aliases mantienen compatibilidad con componentes anteriores.
- [x] Tokens semanticos referencian la paleta raw.
- [x] Build OK.
