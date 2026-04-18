# T-1302 - Crear módulo backend Transfers

## Metadatos
- ID: `T-1302`
- Fase: `Fase 13`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Configurar el módulo backend `Transfers` en NestJS para exponer consultas base de transferencias entre cuentas bancarias internas. Este módulo gestiona los movimientos de fondos entre cuentas de la misma organización.

## Alcance
- Crear `TransfersModule`, `TransfersController`, `TransfersService`.
- Crear `ListTransfersQueryDto` con filtros de cuenta origen, cuenta destino, estatus y rango de fechas.
- Exponer rutas:
  - `GET /api/v1/transfers`
  - `GET /api/v1/transfers/:id`
- Integrar módulo en `AppModule`.
- Implementar consultas base con Prisma (findAll con filtros, findOneById).

## Fuera de alcance
- Endpoints de creación, actualización y eliminación (eso es T-1315 y T-1322).
- DTOs de escritura (eso es T-1309).
- Validación de saldo suficiente en cuenta origen (lógica de negocio Fase 14+).
- Permisos y auditoría (eso es T-1331 y T-1332).

## Dependencias
- `T-1300`: `BankAccountsModule` debe estar creado (cuenta origen y destino son FK a `BankAccount`).
- `T-1301`: `FinancialMovementsModule` creado (una transferencia genera dos movimientos vinculados).
- `T-1200` a `T-1222` (Fase 12): modelos Prisma `Transfer` y enums de estatus deben estar aplicados.

## Criterios de aceptación
- [x] Módulo backend `transfers` creado e integrado en `AppModule`.
- [x] Consultas base con Prisma implementadas (findAll, findOneById).
- [x] DTO de filtros base funcional (`ListTransfersQueryDto`).
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `GET /api/v1/transfers` — responde con array (vacío o con datos demo).
- `GET /api/v1/transfers/:id` — responde con objeto o 404.
- Filtros por `fromAccountId`, `toAccountId`, `status` — reducen correctamente el resultado.

## Riesgos
- **Relación bidireccional con FinancialMovement**: una `Transfer` referencia dos `FinancialMovement` (`outMovementId`, `inMovementId`). Si el include de Prisma incluye ambos, la respuesta puede ser pesada. Mitigación: no incluir movimientos por defecto en la consulta `findAll`.

## Documentación a actualizar
- `apps/api/src/app.module.ts` — importar `TransfersModule`.

## Decisiones clave
- **Transferencia como entidad propia**: la transferencia es una entidad de primer nivel (no solo un par de movimientos) para facilitar la trazabilidad completa y el cierre de balances.
- **Módulo de solo lectura en Bloque 1**: los endpoints CRUD se agregan en bloques posteriores para seguir la progresión de complejidad del bloque.

## Evidencia documental
- `apps/api/src/modules/transfers/transfers.module.ts`
- `apps/api/src/modules/transfers/transfers.controller.ts`
- `apps/api/src/modules/transfers/transfers.service.ts`
- `apps/api/src/modules/transfers/dto/list-transfers-query.dto.ts`

## Pendientes para la siguiente task
- `T-1303` crea el módulo `Reconciliation` con el mismo patrón.

## Pendientes no resueltos
- Ninguno.
