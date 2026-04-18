# Sync Principles

## Carácter no negociable
La sincronización de AtlasERP debe ser segura, auditable y con control explícito de conflictos.

## Fuente de verdad
El servidor valida y confirma el estado oficial de los datos.

## Cliente local
SQLite guarda:
- catálogos cacheados
- operaciones pendientes
- borradores
- conflictos
- bitácora local

## Estados de sincronización
- local_only
- pending_sync
- synced
- server_rejected
- conflict_detected
- awaiting_review
- approved_merge
- discarded_local
- superseded

## Regla crítica
Nada offline se considera oficial hasta que el backend lo confirme.

## Centro obligatorio
Debe existir un módulo visual llamado Sync Center.

## Criterio de cumplimiento
Ningún flujo de sync se aprueba si no soporta detección y revisión de diferencias.

## Referencias de política
- `docs/05-sync/00-politica-soporte-offline.md`
- `docs/05-sync/01-politica-resolucion-conflictos.md`

