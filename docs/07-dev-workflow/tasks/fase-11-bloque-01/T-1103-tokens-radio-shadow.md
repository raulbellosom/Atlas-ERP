# T-1103 - Definir tokens de radio/shadow

## Metadatos
- ID: `T-1103`
- Fase: `Fase 11`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendDesignAgent`

## Alcance
`apps/web/src/assets/index.css` — radios, sombras y transiciones en @theme:

### Radio de bordes
| Token | Valor | Uso |
|-------|-------|-----|
| --radius-xs | 3px | badges compactos |
| --radius-sm | 4px | badges, tags |
| --radius-md | 6px | inputs, botones sm |
| --radius-lg | 8px | botones base, cards sm |
| --radius-xl | 12px | cards, dropdowns |
| --radius-2xl | 16px | modales, side panels |
| --radius-3xl | 24px | elementos hero |
| --radius-full | 9999px | avatars, chips |

### Sombras con undertone navy
Cada nivel de sombra lleva un undertone del color primario (OKLCH 14% 0.02 231 = ink-950).
Esto crea cohesion con la paleta y da profundidad de marca.
- --shadow-xs a --shadow-2xl: escala progresiva
- --shadow-inner: inset para campos con profundidad
- --shadow-focus: ring de foco principal (ink con 22% alpha)
- --shadow-focus-error: ring de foco en error (error con 22% alpha)
- --shadow-focus-success: ring de foco en exito

### Transiciones
- --transition-fast: 80ms ease — micro-interacciones inmediatas
- --transition-base: 150ms ease — estado default
- --transition-slow: 250ms ease — cambios de layout
- --transition-spring: 320ms cubic-bezier(0.34,1.56,0.64,1) — elementos que rebota
- --transition-gentle: 200ms cubic-bezier(0.25,0.46,0.45,0.94) — animaciones suaves

## Criterios de aceptacion
- [x] 8 radios con semantica clara.
- [x] Sombras con undertone navy en todos los niveles.
- [x] Shadow-focus y shadow-focus-error para accesibilidad.
- [x] 5 transiciones con curvas de easing especificas.
- [x] Build OK.
