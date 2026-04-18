# T-1006 - Definir estrategia de retries

## Metadatos
- ID: `T-1006`
- Fase: `Fase 10`
- Bloque: `Bloque 2`
- Estado: `CERRADA`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `SyncCoreAgent`

## Alcance
Definir política de reintentos para operaciones de sincronización con límites y backoff controlado.

## Implementación
- Se documentó estrategia oficial en `docs/05-sync/08-estrategia-retries-sync.md`.
- Se implementó baseline técnico con:
  - `SYNC_RETRY_POLICY`
  - `computeRetryDelay(attempt, policy)`
  - `shouldRetryAttempt(params, policy)`

## Criterios de aceptación
- [x] Política de retries definida (intentos máximos, delays, códigos recuperables).
- [x] Criterios de no-retry explícitos definidos.
- [x] Referencia técnica y documental trazable.

## Evidencia
- `docs/05-sync/08-estrategia-retries-sync.md`
- `packages/sync-contracts/src/retries.js`
