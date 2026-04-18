# T-1004 - Definir versionado de payloads

## Metadatos
- ID: `T-1004`
- Fase: `Fase 10`
- Bloque: `Bloque 1`
- Estado: `CERRADA`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `SyncCoreAgent`

## Alcance
Definir estrategia oficial de versionado de payloads y publicar baseline inicial soportado.

## Implementación
- Se documentó política de versionado en `docs/05-sync/06-versionado-payload-sync.md`.
- Se implementaron:
  - `SYNC_PAYLOAD_VERSION_CURRENT`
  - `SYNC_PAYLOAD_VERSION_SUPPORTED`
  - `SYNC_VERSION_POLICY`
  - `isSemanticVersion(value)`
  - `isSupportedSyncPayloadVersion(value)`

## Criterios de aceptación
- [x] Política de versionado oficial publicada.
- [x] Versión baseline declarada en paquete compartido.
- [x] Validación de compatibilidad de versión disponible.

## Evidencia
- `docs/05-sync/06-versionado-payload-sync.md`
- `packages/sync-contracts/src/versioning.js`
