# T-1102 - Definir tokens de spacing

## Metadatos
- ID: `T-1102`
- Fase: `Fase 11`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendDesignAgent`

## Alcance
`apps/web/src/assets/index.css` — aliases semanticos de espaciado en @theme:

### Tokens definidos
- `--spacing-page-x: 2rem` — padding horizontal de pagina principal
- `--spacing-section-y: 2.5rem` — separacion vertical entre secciones
- `--spacing-card-x: 1.25rem` — padding horizontal de card
- `--spacing-card-y: 1rem` — padding vertical de card
- `--spacing-form-gap: 1.25rem` — gap entre campos de formulario
- `--spacing-input-x: 0.75rem` — padding horizontal de input (12px)
- `--spacing-input-y: 0.5625rem` — padding vertical de input (9px, no-par para mejor baseline)
- `--spacing-table-x: 1rem` — padding horizontal de celda de tabla
- `--spacing-table-y: 0.75rem` — padding vertical de celda de tabla

### Nota
La escala base de Tailwind (1 = 4px) se mantiene intacta. Estos tokens son aliases semanticos de alto nivel que los componentes consumen directamente, haciendo el diseño mas intencional.

## Criterios de aceptacion
- [x] Tokens accesibles como CSS variables via @theme.
- [x] Usan rem para independencia de base-size del usuario.
- [x] Input-y en valor non-par (9px) para mejor alineacion visual.
- [x] Build OK.
