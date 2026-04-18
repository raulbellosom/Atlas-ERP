# T-1315 - Crear servicios de Transfer

## Metadatos
- ID: `T-1315`
- Fase: `Fase 13`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Expandir `TransfersService` con las operaciones de escritura base (create, update, softDelete) necesarias para que los endpoints CRUD del módulo queden operativos en T-1322.

## Alcance
- Métodos agregados en `TransfersService`:
  - `create(dto: CreateTransferDto)`: registra una transferencia entre cuentas con conversión de fecha ISO a `Date`.
  - `update(id: string, dto: UpdateTransferDto)`: actualiza campos de la transferencia. Lanza `NotFoundException` si no existe.
  - `softDelete(id: string)`: marca la transferencia como eliminada (`deletedAt`). Lanza `NotFoundException` si no existe.
- Se conservan métodos de consulta existentes: `findAll`, `findOneById`.

## Fuera de alcance
- Creación atómica de los dos `FinancialMovement` (TRANSFER_OUT/TRANSFER_IN) vinculados: la lógica de transferencia completa es Fase 14.
- Validación de saldo suficiente en cuenta origen.
- Integración con auditoría (eso es T-1331).

## Dependencias
- `T-1309`: DTOs `CreateTransferDto` y `UpdateTransferDto` disponibles.
- `T-1302`: servicio base ya existe con métodos de consulta.

## Criterios de aceptación
- [x] Servicio de `Transfer` ampliado con operaciones de escritura base.
- [x] Soft delete aplicado mediante `deletedAt`.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- Llamar `create()` con `transferDate` ISO válida — debe crear transferencia con `Date` correcta.
- Llamar `update(id)` con id inexistente — debe lanzar `NotFoundException`.
- Llamar `softDelete(id)` — debe establecer `deletedAt` a timestamp actual.
- Verificar que `findAll` no retorna transferencias soft-deleted.

## Riesgos
- **Creación de movimientos vinculados**: en v1, `create()` crea solo la `Transfer` sin los `FinancialMovement` vinculados. Esto es intencional para la MVP. El flujo completo se implementa en Fase 14. Riesgo: la UI puede mostrar una transferencia sin movimientos. Mitigación: documentar la limitación.
- **Cuenta origen = cuenta destino**: si el servicio no valida que `fromAccountId !== toAccountId`, se creará una transferencia circular. Mitigación: agregar validación en `create()` antes de la query Prisma.

## Documentación a actualizar
- `apps/api/src/modules/transfers/transfers.service.ts` — métodos `create`, `update`, `softDelete` agregados.

## Decisiones clave
- **Transferencia sin movimientos vinculados en v1**: la creación atómica de los dos movimientos (OUT + IN) requiere una transacción Prisma compleja con actualización de saldos. Esta lógica se implementa en Fase 14. En v1, la `Transfer` es un registro de intención de transferencia.
- **Soft delete con `deletedAt`**: consistente con el patrón del resto de servicios del módulo.

## Evidencia documental
- `apps/api/src/modules/transfers/transfers.service.ts`

## Pendientes para la siguiente task
- `T-1316` expande `ReconciliationService` con escritura de sesiones e ítems.

## Pendientes no resueltos
- Ninguno.
