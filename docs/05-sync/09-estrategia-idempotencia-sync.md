# Estrategia de Idempotencia de Sync

## ID de definición
- Task origen: `T-1007`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Política oficial
Toda operación de sync debe incluir `idempotencyKey` calculada de forma determinística para prevenir aplicación duplicada.

## Reglas base
- Algoritmo: `sha256`.
- Campos mínimos de construcción: `clientId`, `entity`, `entityId`, `operation`, `occurredAt`.
- TTL de validez de llave: `72 horas`.
- Formato válido de llave: hash hexadecimal de `64` caracteres.

## Fuente técnica
- `packages/sync-contracts/src/idempotency.js`
