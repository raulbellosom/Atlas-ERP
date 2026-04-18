# T-1035 - Implementar acciones de aprobar local

## Metadatos
- ID: `T-1035`
- Fase: `Fase 10`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Resolver conflicto con acción **Aprobar local** desde `ConflictDetailPanel`:

- Nueva acción `APPROVE_LOCAL` en servicio local de resolución.
- Crea un nuevo `sync_item` en estado pendiente/aprobado con el payload local.
- Cancela el item en conflicto original para mantener trazabilidad.
- Si el error contiene `conflictId=...`, intenta cerrar también el conflicto en backend.

## Criterios de aceptación
- [x] Existe botón de acción "Aprobar local" en el panel de conflicto.
- [x] La acción reencola un item nuevo para reintento de sync.
- [x] El item anterior queda cancelado con razón de resolución.
- [x] Build desktop OK.
