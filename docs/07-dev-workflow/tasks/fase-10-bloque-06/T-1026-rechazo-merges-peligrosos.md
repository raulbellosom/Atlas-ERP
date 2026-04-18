# T-1026 - Implementar rechazo explicito de merges peligrosos

## Metadatos
- ID: `T-1026`
- Fase: `Fase 10`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAgent`

## Alcance
`sync.service.ts` — deteccion y marcado diferenciado de conflictos en entidades financieras:

- `DANGEROUS_ENTITIES` (Set): financial_movement, financial_transfer, financial_account
- `isDangerousMerge(entity, operation)`: true si entidad esta en DANGEROUS_ENTITIES y operation != 'delete'
- `processSingleItem` actualizado:
  - Conflictos en entidades peligrosas → `ConflictStatus.IN_REVIEW` (requiere atencion humana activa)
  - Conflictos normales → `ConflictStatus.OPEN` (revision estandar)
  - Log diferenciado: evento 'ITEM_CONFLICT_DANGEROUS' con SyncLogLevel.ERROR para peligrosos
  - Mensaje de resultado diferenciado: "Conflicto peligroso (requiere autorizacion)" vs "Conflicto en campos"

## Criterios de aceptacion
- [x] Conflictos en financial_movement/transfer/account crean ConflictRecord con status=IN_REVIEW.
- [x] Conflictos peligrosos NUNCA se auto-resuelven aunque haya estrategia definida.
- [x] El log registra evento ITEM_CONFLICT_DANGEROUS con level=ERROR.
- [x] typecheck + lint OK.
