# T-1322 - Crear endpoints CRUD de transferencias

## Metadatos
- ID: `T-1322`
- Fase: `Fase 13`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Exponer las operaciones CRUD base de transferencias entre cuentas a través del controlador NestJS, conectando los DTOs de T-1309 y los métodos de servicio de T-1315 con la capa HTTP.

## Alcance
- Endpoints agregados en `TransfersController`:
  - `POST /api/v1/transfers` → `service.create(dto)` (201)
  - `PATCH /api/v1/transfers/:id` → `service.update(id, dto)` (200)
  - `DELETE /api/v1/transfers/:id` → `service.softDelete(id)` (204)
- Endpoints de consulta existentes preservados:
  - `GET /api/v1/transfers`
  - `GET /api/v1/transfers/:id`
- Manejo de `NotFoundException` propagada desde el servicio (retorna 404).

## Fuera de alcance
- Permisos y auditoría (eso es T-1331 y T-1332).
- Creación atómica de movimientos TRANSFER_OUT/TRANSFER_IN (Fase 14).

## Dependencias
- `T-1309`: `CreateTransferDto` y `UpdateTransferDto` disponibles.
- `T-1315`: `TransfersService.create()`, `update()`, `softDelete()` implementados.

## Criterios de aceptación
- [x] CRUD base de `Transfers` expuesto en API.
- [x] Errores `404` en update/delete para IDs inexistentes.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `POST /api/v1/transfers` sin `fromAccountId` → 400.
- `POST /api/v1/transfers` con `fromAccountId === toAccountId` → 400 (validación en servicio).
- `POST /api/v1/transfers` con body válido → 201.
- `DELETE /api/v1/transfers/:id` exitoso → 204.

## Riesgos
- **Transferencia sin movimientos vinculados**: al crear una transferencia en v1, no se crean los movimientos TRANSFER_OUT/TRANSFER_IN. El cliente debe ser informado de esta limitación.

## Documentación a actualizar
- `apps/api/src/modules/transfers/transfers.controller.ts` — handlers `create`, `update`, `remove` agregados.

## Decisiones clave
- **DELETE en transferencias**: aunque eliminar una transferencia podría afectar el balance contable, el soft-delete en v1 es la única opción. En Fase 14 se agregarán reglas de negocio que prevengan eliminar transferencias procesadas.

## Evidencia documental
- `apps/api/src/modules/transfers/transfers.controller.ts`

## Pendientes para la siguiente task
- `T-1323` expone los endpoints CRUD de `ReceivablesLite`.

## Pendientes no resueltos
- Ninguno.
