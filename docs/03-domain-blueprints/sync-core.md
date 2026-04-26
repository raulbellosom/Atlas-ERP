# Sync Core Blueprint

## Propósito
Permitir trabajo offline parcial en web y desktop, con sincronización validada por servidor.

## Entidades sugeridas
- Device
- LocalSyncSession
- SyncItem
- ConflictRecord
- ConflictResolution
- SyncLog

## Flujo
1. Cliente crea o modifica una entidad permitida offline.
2. Se almacena localmente en SQLite con estado `pending_sync`.
3. Se envía al backend cuando hay conectividad.
4. El backend valida negocio, versión y referencias.
5. Si acepta -> `synced`
6. Si rechaza -> `server_rejected`
7. Si detecta diferencia -> `conflict_detected` y crea `ConflictRecord`

## Centro visual
Sync Center con:
- pendientes
- conflictos
- aprobaciones
- descartes
- historial

