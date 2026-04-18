# T-1101 - Definir tokens de tipografia

## Metadatos
- ID: `T-1101`
- Fase: `Fase 11`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendDesignAgent`

## Alcance
`apps/web/src/assets/index.css` + `apps/web/index.html` — sistema de fuentes Meridian:

### Fuentes
- `--font-display: 'DM Serif Display'` — serif editorial para titulos de seccion y display. Differentiator visual principal.
- `--font-sans: 'Outfit'` — geometric sans calido. Reemplaza Inter. No overused.
- `--font-mono: 'JetBrains Mono'` — para datos financieros, IDs, codigos, celdas numericas.

### HTML
- Google Fonts preconnect + link con display=swap para las 3 fuentes.
- Pesos: DM Serif Display (400, 400 italic), Outfit (300/400/500/600), JetBrains Mono (400/500, italic 400).

### Base layer
- html: font-family = Outfit, font-smoothing, text-rendering optimizeLegibility.
- body: font-size 15px, line-height 1.55.
- h1-h6: font-family = DM Serif Display, letter-spacing -0.01em, line-height 1.2.
- code/kbd/pre: font-family = JetBrains Mono.
- Helper classes: `.heading-display` (DM Serif, weight 400, tracking -0.02em), `.label-caps` (Outfit, 11px, weight 600, uppercase, tracking 0.08em).

## Criterios de aceptacion
- [x] DM Serif Display en h1-h6 via base layer.
- [x] Outfit como font-sans por defecto.
- [x] JetBrains Mono para mono/code.
- [x] Google Fonts cargado sin bloqueo (display=swap).
- [x] Build OK.
