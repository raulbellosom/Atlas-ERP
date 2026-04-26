# Contrato Global de Sincronización

## ID de definición
- Task origen: `T-1000`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Objetivo
Definir un contrato único y explícito para intercambiar operaciones de sincronización entre clientes (web/desktop) y servidor.

## Contrato oficial (baseline)
Todo intercambio de sincronización debe cumplir la estructura de `sync batch payload`:
- `version`: versión del contrato de payload.
- `requestId`: identificador de trazabilidad de la solicitud.
- `sentAt`: fecha/hora ISO de envío.
- `client`: metadatos del cliente emisor.
- `batch.totalItems`: cantidad de operaciones enviadas.
- `batch.items[]`: operaciones de sincronización.

## Principios contractuales
- El contrato es **explícito y versionado**.
- Toda operación incluye `idempotencyKey`.
- Toda operación incluye `entity`, `operation`, `entityId` y `occurredAt`.
- El servidor valida contrato antes de aplicar cambios.

## Fuente técnica
Implementación base en `packages/sync-contracts/src/`.
