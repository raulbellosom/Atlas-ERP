# T-1104 - Definir semantica de colores de estados

## Metadatos
- ID: `T-1104`
- Fase: `Fase 11`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendDesignAgent`

## Alcance
`apps/web/src/assets/index.css` — semantica completa de estados en @theme:

### Estados definidos (cada uno con 4 tokens)
| Estado | Base | -subtle | -border | on-* |
|--------|------|---------|---------|------|
| success | oklch(59% 0.168 148) | oklch(97% 0.032 148) | oklch(86% 0.095 148) | blanco |
| error | oklch(53.5% 0.215 27) | oklch(97.5% 0.032 27) | oklch(87% 0.095 27) | blanco |
| warning | oklch(70.5% 0.178 75) | oklch(97.5% 0.038 75) | oklch(88% 0.118 75) | oscuro (19% L) |
| info | oklch(56% 0.17 231) | oklch(96.5% 0.025 231) | oklch(85% 0.08 231) | blanco |

### Decision de diseno: Warning con texto oscuro
El amber/warning es suficientemente claro (70.5% L) para requerir texto oscuro (on-warning).
Esto garantiza ratio de contraste WCAG AA sin sacrificar el color amber.

### Uso previsto por token
- **base**: el color del icono/borde del componente de estado
- **-subtle**: fondo de banner/alert (muy bajo contraste, envolvente)
- **-border**: borde del componente (media saturacion)
- **on-***: texto sobre fondo base (garantiza contraste minimo 4.5:1)

## Criterios de aceptacion
- [x] 4 estados con 4 tokens cada uno (16 tokens totales de estado).
- [x] Warning usa on-warning oscuro por contraste adecuado.
- [x] Todos en OKLCH para maxima vibrancia perceptual uniforme.
- [x] Compatibles con Badge, Toast, Input, Alert en bloques siguientes.
- [x] Build OK.
