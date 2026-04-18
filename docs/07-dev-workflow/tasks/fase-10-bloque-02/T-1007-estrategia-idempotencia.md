# T-1007 - Definir estrategia de idempotencia

## Metadatos
- ID: `T-1007`
- Fase: `Fase 10`
- Bloque: `Bloque 2`
- Estado: `CERRADA`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `SyncCoreAgent`

## Alcance
Definir estándar de idempotencia para que cada operación de sync sea aplicable una sola vez de forma segura.

## Implementación
- Se documentó estrategia oficial en `docs/05-sync/09-estrategia-idempotencia-sync.md`.
- Se implementó baseline técnico con:
  - `SYNC_IDEMPOTENCY_POLICY`
  - `buildIdempotencyKey(params)`
  - `isValidIdempotencyKey(key)`
  - `isIdempotencyKeyExpired(createdAt, now)`

## Criterios de aceptación
- [x] Regla de construcción de llave idempotente definida.
- [x] Validación de formato y expiración definida.
- [x] Referencia técnica y documental trazable.

## Evidencia
- `docs/05-sync/09-estrategia-idempotencia-sync.md`
- `packages/sync-contracts/src/idempotency.js`
