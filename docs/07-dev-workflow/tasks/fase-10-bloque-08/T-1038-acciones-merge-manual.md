# T-1038 - Implementar acciones de merge manual

## Metadatos
- ID: `T-1038`
- Fase: `Fase 10`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Resolver conflicto con acción **Merge manual**:

- Toggle "Merge manual" en `ConflictDetailPanel`.
- Editor `textarea` para JSON del payload final.
- Validación de JSON antes de ejecutar.
- Crea nuevo `sync_item` pendiente/aprobado con payload mergeado.
- Cancela item conflictivo original y registra razón.

## Criterios de aceptación
- [x] Se puede abrir/cerrar el editor de merge manual.
- [x] Si el JSON es inválido, la UI muestra error y no ejecuta acción.
- [x] Si el JSON es válido, se reencola un item nuevo con payload mergeado.
- [x] Build desktop OK.
