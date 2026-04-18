# Estrategia de Retries de Sync

## ID de definición
- Task origen: `T-1006`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Política oficial
Los retries de sync usan `exponential backoff with jitter` con límite de intentos y control de errores no recuperables.

## Reglas base
- `maxAttempts`: `5`.
- `baseDelayMs`: `1000`.
- `maxDelayMs`: `60000`.
- `jitterRatio`: `0.2`.
- Códigos HTTP recuperables: `408`, `409`, `425`, `429`, `500`, `502`, `503`, `504`.
- Errores no recuperables: `VALIDATION_ERROR`, `AUTH_ERROR`, `FORBIDDEN`.

## Fuente técnica
- `packages/sync-contracts/src/retries.js`
