# Versionado de Payloads de Sync

## ID de definición
- Task origen: `T-1004`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Política oficial
El payload de sync usa `semver`:
- `major`: cambio rompiente de contrato.
- `minor`: extensión retrocompatible.
- `patch`: corrección retrocompatible.

## Versión baseline actual
- `SYNC_PAYLOAD_VERSION_CURRENT`: `1.0.0`
- `SYNC_PAYLOAD_VERSION_SUPPORTED`: `["1.0.0"]`

## Regla de negociación
- Cliente declara `version` en cada batch.
- Servidor acepta solo versiones soportadas.
- Si la versión no es soportada, el servidor rechaza y obliga actualización de cliente.

## Fuente técnica
- `packages/sync-contracts/src/versioning.js`
