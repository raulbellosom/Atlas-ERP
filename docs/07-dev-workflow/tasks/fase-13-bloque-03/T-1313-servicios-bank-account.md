# T-1313 - Crear servicios de BankAccount

## Metadatos
- ID: `T-1313`
- Fase: `Fase 13`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Expandir `BankAccountsService` con las operaciones de escritura base (create, update, softDelete) necesarias para que los endpoints CRUD del módulo queden operativos en T-1320.

## Alcance
- Métodos agregados en `BankAccountsService`:
  - `create(dto: CreateBankAccountDto)`: crea una nueva cuenta bancaria con saldo inicial y estatus activo.
  - `update(id: string, dto: UpdateBankAccountDto)`: actualiza campos de la cuenta existente. Lanza `NotFoundException` si no existe.
  - `softDelete(id: string)`: marca la cuenta como eliminada (`deletedAt`) e inactiva (`isActive: false`). Lanza `NotFoundException` si no existe.
- Se conservan métodos de consulta existentes: `findAll`, `findOneById`, `countActiveByOrganization`.

## Fuera de alcance
- Validación de saldo suficiente al eliminar (una cuenta con saldo no debería eliminarse — eso es Fase 14 business rules).
- Método `getBalanceByAccount` y `getBalanceSummaryByOrganization` (eso es T-1325 y T-1327).
- Integración con auditoría (eso es T-1331).

## Dependencias
- `T-1307`: DTOs `CreateBankAccountDto` y `UpdateBankAccountDto` disponibles.
- `T-1300`: servicio base ya existe con métodos de consulta.

## Criterios de aceptación
- [x] Servicio de `BankAccount` ampliado con operaciones de escritura base.
- [x] Soft delete aplicado mediante `deletedAt` e inactivación (`isActive: false`).
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- Llamar `create()` con datos válidos — debe crear registro en BD con `isActive: true` y `deletedAt: null`.
- Llamar `update(id)` con id inexistente — debe lanzar `NotFoundException`.
- Llamar `softDelete(id)` — debe establecer `deletedAt` y `isActive: false`.
- Verificar que `findAll` no retorna cuentas soft-deleted.

## Riesgos
- **Soft delete sin filtro en findAll**: si `findAll` no filtra por `deletedAt: null`, las cuentas eliminadas aparecerán en las listas. Mitigación: asegurar que `findAll` incluye `where: { deletedAt: null }`.
- **Número de cuenta duplicado**: si existe constraint UNIQUE en `accountNumber`, el servicio debe manejar el error Prisma `P2002` y lanzar `ConflictException`.

## Documentación a actualizar
- `apps/api/src/modules/bank-accounts/bank-accounts.service.ts` — métodos `create`, `update`, `softDelete` agregados.

## Decisiones clave
- **Soft delete doble**: se establece tanto `deletedAt` (timestamp) como `isActive: false`. El timestamp permite auditoría histórica, y el flag booleano facilita las queries de filtrado en Prisma.
- **`NotFoundException` en update y softDelete**: si el ID no existe, se lanza `NotFoundException` (404) en lugar de fallar silenciosamente. Esto es consistente con el comportamiento del resto de módulos del backend.

## Evidencia documental
- `apps/api/src/modules/bank-accounts/bank-accounts.service.ts`

## Pendientes para la siguiente task
- `T-1314` expande el servicio `FinancialMovementsService` con el mismo patrón.

## Pendientes no resueltos
- Ninguno.
