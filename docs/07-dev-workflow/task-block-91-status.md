# Task Block 91 Status - Fase 12 Bloque 4

## Identificación
- Bloque: `Bloque 4`
- Fase: `Fase 12`
- Tasks: `T-1215` a `T-1219`
- Estado: `CERRADO`
- Fecha de cierre: `2026-04-14`

## Tasks del bloque

| Task | Título | Estado |
|------|--------|--------|
| T-1215 | Crear modelo CounterpartyLite si aplica | CERRADA |
| T-1216 | Crear modelo ReceivableLite | CERRADA |
| T-1217 | Crear modelo PayableLite | CERRADA |
| T-1218 | Crear enums del módulo | CERRADA |
| T-1219 | Crear migraciones del módulo | CERRADA |

## Entregables

### Esquema Prisma actualizado
- [schema.prisma](D:/RacoonDevs/AtlasERP/prisma/schema.prisma)
  - Nuevos modelos: `CounterpartyLite`, `ReceivableLite`, `PayableLite`.
  - Nuevos enums del módulo financiero (movimientos, transferencias, conciliación, snapshots, terceros y cuentas lite).
  - Campos financieros migrados de `String` a enums en modelos existentes.

### Migración del bloque
- [migration.sql](D:/RacoonDevs/AtlasERP/prisma/migrations/20260414001955_fase12_bloque04_financial_lite_enums/migration.sql)
  - SQL de migración generado para los cambios acumulados hasta `T-1219`.

### Evidencia de tasks
- [T-1215-modelo-counterparty-lite.md](D:/RacoonDevs/AtlasERP/docs/07-dev-workflow/tasks/fase-12-bloque-04/T-1215-modelo-counterparty-lite.md)
- [T-1216-modelo-receivable-lite.md](D:/RacoonDevs/AtlasERP/docs/07-dev-workflow/tasks/fase-12-bloque-04/T-1216-modelo-receivable-lite.md)
- [T-1217-modelo-payable-lite.md](D:/RacoonDevs/AtlasERP/docs/07-dev-workflow/tasks/fase-12-bloque-04/T-1217-modelo-payable-lite.md)
- [T-1218-enums-modulo-financial-operations.md](D:/RacoonDevs/AtlasERP/docs/07-dev-workflow/tasks/fase-12-bloque-04/T-1218-enums-modulo-financial-operations.md)
- [T-1219-migraciones-modulo-financial-operations.md](D:/RacoonDevs/AtlasERP/docs/07-dev-workflow/tasks/fase-12-bloque-04/T-1219-migraciones-modulo-financial-operations.md)

## Validaciones
- `pnpm.cmd --filter @atlasrep/api exec prisma format --schema ../../prisma/schema.prisma`: OK
- `pnpm.cmd --filter @atlasrep/api run db:generate`: OK
- `pnpm.cmd --filter @atlasrep/api run typecheck`: OK
- `pnpm.cmd --filter @atlasrep/api run lint`: OK
- `pnpm.cmd --filter @atlasrep/api exec prisma migrate diff --from-migrations ../../prisma/migrations --to-schema-datamodel ../../prisma/schema.prisma --shadow-database-url postgresql://atlaserp:atlaserp_dev@localhost:5432/atlaserp_shadow --exit-code`: OK

## Nota de ejecución
- `prisma migrate dev` detectó `drift` histórico en la base local y sugirió reset.
- Para respetar no destructividad del entorno, la migración se generó con `prisma migrate diff` usando shadow DB.
