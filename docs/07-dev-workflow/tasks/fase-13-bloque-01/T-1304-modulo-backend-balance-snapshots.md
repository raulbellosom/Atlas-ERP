# T-1304 - Crear módulo backend BalanceSnapshots

## Metadatos
- ID: `T-1304`
- Fase: `Fase 13`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Configurar el módulo backend `BalanceSnapshots` en NestJS para exponer consultas base de cortes de saldo bancario. Este módulo permite auditar el saldo histórico de cada cuenta en cualquier momento del tiempo.

## Alcance
- Crear `BalanceSnapshotsModule`, `BalanceSnapshotsController`, `BalanceSnapshotsService`.
- Crear `ListBalanceSnapshotsQueryDto` con filtros de cuenta bancaria, organización y rango de fechas.
- Exponer rutas:
  - `GET /api/v1/balance-snapshots`
  - `GET /api/v1/balance-snapshots/:id`
  - `GET /api/v1/balance-snapshots/bank-account/:bankAccountId/latest`
- Integrar módulo en `AppModule`.
- Implementar consultas base con Prisma (findAll con filtros, findOneById, findLatestByBankAccount).

## Fuera de alcance
- Endpoint de creación de cortes (eso es T-1317).
- DTOs de escritura (fuera del scope de Bloque 1).
- Cálculo automático de saldo (eso es lógica de negocio de Fase 14+).
- Permisos y auditoría (eso es T-1331 y T-1332).

## Dependencias
- `T-1300`: `BankAccountsModule` creado (los snapshots referencian una cuenta bancaria).
- `T-1200` a `T-1222` (Fase 12): modelo Prisma `BalanceSnapshot` debe estar aplicado.

## Criterios de aceptación
- [x] Módulo backend `balance-snapshots` creado e integrado en `AppModule`.
- [x] Consultas base con Prisma implementadas (findAll, findOneById, findLatestByBankAccount).
- [x] DTO de filtros base funcional (`ListBalanceSnapshotsQueryDto`).
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `GET /api/v1/balance-snapshots` — responde con array (vacío o con datos demo).
- `GET /api/v1/balance-snapshots/:id` — responde con objeto o 404.
- `GET /api/v1/balance-snapshots/bank-account/:bankAccountId/latest` — responde con el corte más reciente de la cuenta o 404.

## Riesgos
- **Ruta `/bank-account/:bankAccountId/latest` vs. `/:id`**: NestJS puede confundir el segmento `bank-account` como un id. Mitigación: registrar la ruta específica antes de la genérica `/:id` en el controlador.
- **BalanceSnapshot sin softDelete**: el modelo no tiene `deletedAt` (es registro histórico inmutable). El servicio no debe ofrecer `softDelete`.

## Documentación a actualizar
- `apps/api/src/app.module.ts` — importar `BalanceSnapshotsModule`.

## Decisiones clave
- **Snapshot como registro histórico inmutable**: los cortes de saldo no se eliminan ni modifican — son evidencia de auditoría. Por esta razón el módulo no tendrá endpoint DELETE en ninguna fase.
- **`findLatestByBankAccount` como endpoint propio**: el snapshot más reciente es la consulta más frecuente desde la UI, por lo que se expone como ruta dedicada en lugar de filtrar desde la lista general.

## Evidencia documental
- `apps/api/src/modules/balance-snapshots/balance-snapshots.module.ts`
- `apps/api/src/modules/balance-snapshots/balance-snapshots.controller.ts`
- `apps/api/src/modules/balance-snapshots/balance-snapshots.service.ts`
- `apps/api/src/modules/balance-snapshots/dto/list-balance-snapshots-query.dto.ts`

## Pendientes para la siguiente task
- `T-1305` crea el módulo `ReceivablesLite` (Bloque 2), completando los 7 módulos del dominio.

## Pendientes no resueltos
- Ninguno.
