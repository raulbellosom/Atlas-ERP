# T-1001 - Definir tipos de entidades sincronizables

## Metadatos
- ID: `T-1001`
- Fase: `Fase 10`
- Bloque: `Bloque 1`
- Estado: `CERRADA`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `SyncCoreAgent`

## Alcance
Definir el catálogo inicial de entidades permitidas para operaciones de sincronización.

## Implementación
- Se documentó catálogo oficial v1 en `docs/05-sync/03-tipos-entidades-sincronizables.md`.
- Se implementó lista inmutable `SYNC_ENTITY_TYPES`.
- Se implementó helper contractual `isSyncEntityType(value)`.

## Criterios de aceptación
- [x] Catálogo oficial de entidades sincronizables publicado.
- [x] Lista técnica centralizada en paquete compartido.
- [x] Función de validación contractual disponible.

## Evidencia
- `docs/05-sync/03-tipos-entidades-sincronizables.md`
- `packages/sync-contracts/src/entities.js`
