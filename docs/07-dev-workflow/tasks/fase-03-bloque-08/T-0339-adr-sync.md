# T-0339 - Crear ADR inicial de sync architecture

## Metadatos
- ID: `T-0339`
- Fase: `Fase 3`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `SyncEngineAgent` + `SystemArchitectAgent`

## Objetivo
Documentar la arquitectura de sincronizacion local/servidor (SQLite + PostgreSQL) como ADR-004.

## Criterios de aceptación
- [x] `docs/09-adr/004-arquitectura-sync.md` creado con estado `aprobado`.
- [x] Flujo offline → online documentado con diagrama ASCII.
- [x] Tablas SQLite locales documentadas: sync_queue, sync_conflicts, cache_snapshots, local_preferences.
- [x] Reglas de conflicto: no merge automatico en datos sensibles.
- [x] PostgreSQL como fuente de verdad — SQLite solo auxiliar.
- [x] Restriccion: toda resolucion de conflicto se audita.

## Archivos creados
- `docs/09-adr/004-arquitectura-sync.md`

## Restricciones que establece este ADR
- PostgreSQL es siempre la fuente de verdad — SQLite es auxiliar local.
- No merge automatico de conflictos en datos financieros o criticos.
- Toda resolucion de conflicto debe registrarse en audit_log del servidor.
- El Sync Center en UI es obligatorio para la app desktop.
