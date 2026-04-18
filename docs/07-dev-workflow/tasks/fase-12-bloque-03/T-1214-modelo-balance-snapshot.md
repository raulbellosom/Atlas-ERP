# T-1214 - Crear modelo BalanceSnapshot

## Metadatos
- ID: `T-1214`
- Fase: `Fase 12`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `DesktopAgent`

## Objetivo
Crear el modelo Prisma `BalanceSnapshot` que almacena cortes de saldo de una cuenta bancaria en momentos específicos. Permite consultar el saldo histórico sin necesidad de recalcular sobre todos los movimientos, optimizando las consultas de reportes y dashboards.

## Alcance
- Crear modelo `BalanceSnapshot` con campos: id, organizationId, bankAccountId, branchId, snapshotDate (DateTime), balance (Decimal), currencyCode, source (enum: MANUAL, AUTOMATIC, RECONCILIATION), capturedById, notes (nullable), createdAt.
- Relaciones: `Organization`, `BankAccount`, `Branch`, `User` (capturedBy).
- Definir índices: por `organizationId + bankAccountId + snapshotDate` (único), por `bankAccountId + snapshotDate`.
- Ejecutar `prisma generate`, `typecheck` y `lint`.

## Fuera de alcance
- No incluye migración SQL (eso es `T-1219`).
- No incluye seeds (eso es `T-1220`).
- No incluye DTOs ni endpoints (eso es Fase 13).
- No incluye cálculo automático de saldo (eso es lógica de negocio en Fase 13).

## Dependencias
- `T-1207` (`BankAccount`): la FK `bankAccountId` requiere que `BankAccount` exista.
- `T-1203` (catálogo de entidades): `BalanceSnapshot` fue declarada como entidad auxiliar en el blueprint.

## Criterios de aceptación
- [x] Modelo `BalanceSnapshot` creado en Prisma.
- [x] Índices por organización/cuenta/fecha definidos.
- [x] Campos operativos de saldo, moneda, fuente y timestamp definidos.
- [x] Enum `SnapshotSource` definido.
- [x] `prisma generate`, `typecheck` y `lint` en verde.

## Validaciones
- Verificar que `balance` usa `Decimal` (no `Float`) para precisión financiera.
- Confirmar que el índice único `@@unique([organizationId, bankAccountId, snapshotDate])` evita duplicados de corte en la misma fecha.
- Revisar que `source` es un enum válido en Prisma.

## Pruebas
- `pnpm prisma validate` — sin errores de schema.
- `pnpm prisma generate` — cliente Prisma generado con `BalanceSnapshot` y enum `SnapshotSource`.
- `pnpm typecheck` — sin errores TypeScript.

## Riesgos
- **Múltiples snapshots el mismo día**: si no hay índice único por fecha, pueden crearse varios cortes del mismo día para la misma cuenta. Mitigación: el índice `@@unique([organizationId, bankAccountId, snapshotDate])` previene esto.
- **Desincronización con `currentBalance`**: si `BankAccount.currentBalance` y `BalanceSnapshot` no son consistentes, los reportes históricos serán incorrectos. Mitigación: el servicio que crea snapshots debe usar el mismo cálculo que actualiza `currentBalance`.

## Documentación a actualizar
- `apps/api/prisma/schema.prisma` — añadir modelo `BalanceSnapshot` y enum `SnapshotSource`.

## Decisiones clave
- **`BalanceSnapshot` como desnormalización justificada**: se acepta la redundancia de datos de saldo porque el beneficio de rendimiento en consultas históricas supera el costo de mantenerlos sincronizados.
- **`source` enum**: distingue si el corte fue creado manualmente por un usuario, de forma automática por el sistema (scheduler) o al cerrar una sesión de conciliación, para trazabilidad de auditoría.

## Evidencia documental
- `apps/api/prisma/schema.prisma` — modelo `BalanceSnapshot`, enum `SnapshotSource`.

## Pendientes para la siguiente task
- Bloque 4 (`T-1215`) continúa con el modelado de entidades de receivables/payables lite.

## Pendientes no resueltos
- Ninguno.
