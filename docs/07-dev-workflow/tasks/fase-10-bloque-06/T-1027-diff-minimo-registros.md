# T-1027 - Implementar diff minimo entre registros

## Metadatos
- ID: `T-1027`
- Fase: `Fase 10`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAgent`

## Alcance
`sync.service.ts` — funcion de diff estructurado campo a campo:

- `MinimalDiff` (interfaz exportada):
  - `added: string[]` — campos en local pero no en server
  - `removed: string[]` — campos en server pero no en local
  - `changed: Record<string, { from: unknown; to: unknown }>` — campos en ambos con valores distintos
- `computeMinimalDiff(local, server) → MinimalDiff`:
  - Itera union de keys de ambos payloads
  - Usa JSON.stringify para comparacion profunda
  - Exportada con `export function` para uso en tests futuros
- Integrada en `processSingleItem`: el minDiff se incluye en metadata del SyncLog

## Criterios de aceptacion
- [x] added/removed/changed reflejan correctamente diferencias campo a campo.
- [x] Campos identicos no aparecen en changed.
- [x] Exportada para tests unitarios futuros.
- [x] typecheck + lint OK.
