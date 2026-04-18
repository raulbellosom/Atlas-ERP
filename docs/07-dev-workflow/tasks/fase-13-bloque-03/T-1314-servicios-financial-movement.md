# T-1314 - Crear servicios de FinancialMovement

## Metadatos
- ID: `T-1314`
- Fase: `Fase 13`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Expandir `FinancialMovementsService` con las operaciones de escritura base (create, update, softDelete) necesarias para que los endpoints CRUD del módulo queden operativos en T-1321.

## Alcance
- Métodos agregados en `FinancialMovementsService`:
  - `create(dto: CreateFinancialMovementDto)`: registra un movimiento financiero con conversión de fecha ISO a `Date`.
  - `update(id: string, dto: UpdateFinancialMovementDto)`: actualiza campos del movimiento. Lanza `NotFoundException` si no existe.
  - `softDelete(id: string)`: marca el movimiento como eliminado (`deletedAt`). Lanza `NotFoundException` si no existe.
- Se conservan métodos de consulta existentes: `findAll`, `findOneById`.

## Fuera de alcance
- Método `uploadProof` y `listProofs` para comprobantes (eso es T-1330).
- Método `findByFilters` explícito (eso es T-1326).
- Integración con auditoría (eso es T-1331).

## Dependencias
- `T-1308`: DTOs `CreateFinancialMovementDto` y `UpdateFinancialMovementDto` disponibles.
- `T-1301`: servicio base ya existe con métodos de consulta.

## Criterios de aceptación
- [x] Servicio de `FinancialMovement` ampliado con operaciones de escritura base.
- [x] Soft delete aplicado mediante `deletedAt`.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- Llamar `create()` con fecha ISO válida — debe crear movimiento con `Date` correcta en BD.
- Llamar `update(id)` con id inexistente — debe lanzar `NotFoundException`.
- Llamar `softDelete(id)` — debe establecer `deletedAt` a timestamp actual.
- Verificar que movimientos soft-deleted no aparecen en `findAll`.

## Riesgos
- **Conversión de fecha**: el DTO recibe `movementDate` como string ISO. El servicio debe hacer `new Date(dto.movementDate)` antes de pasar a Prisma para evitar errores de tipo.
- **Monto como Decimal de Prisma**: Prisma `Decimal` es diferente a `number` JavaScript. El servicio debe asegurarse de convertir el `number` del DTO al tipo `Decimal` o `string` que acepta Prisma.

## Documentación a actualizar
- `apps/api/src/modules/financial-movements/financial-movements.service.ts` — métodos `create`, `update`, `softDelete` agregados.

## Decisiones clave
- **Conversión de tipos en el servicio**: la conversión de `string → Date` y `number → Decimal` se hace en el servicio, no en el DTO, para mantener el DTO como un contrato de validación puro.
- **Soft delete en movimientos**: los movimientos financieros no se eliminan físicamente para mantener trazabilidad contable. El soft delete con `deletedAt` es la única forma de "eliminar" un movimiento en v1.

## Evidencia documental
- `apps/api/src/modules/financial-movements/financial-movements.service.ts`

## Pendientes para la siguiente task
- `T-1315` (Bloque 4) expande `TransfersService` con escritura.

## Pendientes no resueltos
- Ninguno.
