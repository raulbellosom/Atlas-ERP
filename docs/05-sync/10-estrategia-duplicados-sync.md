# Estrategia de Detección de Duplicados de Sync

## ID de definición
- Task origen: `T-1008`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Política oficial
La detección de duplicados combina `idempotencyKey` y `fingerprint` de operación para proteger la cola y el procesamiento batch.

## Reglas base
- Estrategia principal: `fingerprint_and_idempotency_key`.
- Se prioriza `idempotencyKey` cuando existe.
- Huella (`fingerprint`) calculada con `entity`, `entityId`, `operation`, `payload`, `occurredAt`.
- La cola puede deduplicar de forma preventiva antes de enviar batch.

## Fuente técnica
- `packages/sync-contracts/src/duplicates.js`
