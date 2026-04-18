# T-1020 - Implementar persistencia backend de SyncItem

## Metadatos
- ID: `T-1020`
- Fase: `Fase 10`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAgent`

## Alcance
`sync.service.ts` — `processSingleItem()` refactorizado:

- **Idempotencia corregida**: busca `SyncItem` existente por `entityType + entityId + operation` con status=APPLIED|SYNCED, en lugar del bug previo que usaba `item.itemId` como `entityId`.
- **Status semántico**: crea SyncItem con `status=APPLIED` (éxito), `status=CONFLICT_DETECTED` (conflicto), y actualiza a `status=FAILED` con `errorMessage` en caso de excepción.
- **Idempotencia inteligente**: si existe un item previo con el mismo contenido (mismo hash de payload) → retorna `idempotent` sin crear duplicado. Si el contenido difiere → es un conflicto real.

## Criterios de aceptacion
- [x] SyncItem creado con status correcto en cada escenario.
- [x] errorMessage persistido en caso de fallo.
- [x] typecheck + lint OK.
