# T-1321 - Crear endpoints CRUD de movimientos

## Metadatos
- ID: `T-1321`
- Fase: `Fase 13`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Exponer las operaciones CRUD base de movimientos financieros a través del controlador NestJS, conectando los DTOs de T-1308 y los métodos de servicio de T-1314 con la capa HTTP.

## Alcance
- Endpoints agregados en `FinancialMovementsController`:
  - `POST /api/v1/financial-movements` → `service.create(dto)` (201)
  - `PATCH /api/v1/financial-movements/:id` → `service.update(id, dto)` (200)
  - `DELETE /api/v1/financial-movements/:id` → `service.softDelete(id)` (204)
- Endpoints de consulta existentes preservados:
  - `GET /api/v1/financial-movements`
  - `GET /api/v1/financial-movements/:id`
- Manejo de `NotFoundException` propagada desde el servicio (retorna 404).

## Fuera de alcance
- Endpoint de filtros explícito (`/by-filters`) — eso es T-1326.
- Upload de comprobantes — eso es T-1330.
- Permisos y auditoría — eso es T-1331 y T-1332.

## Dependencias
- `T-1308`: `CreateFinancialMovementDto` y `UpdateFinancialMovementDto` disponibles.
- `T-1314`: `FinancialMovementsService.create()`, `update()`, `softDelete()` implementados.

## Criterios de aceptación
- [x] CRUD base de `FinancialMovements` expuesto en API.
- [x] Errores `404` en update/delete para IDs inexistentes.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `POST /api/v1/financial-movements` con `movementType` inválido → 400.
- `POST /api/v1/financial-movements` con body válido → 201.
- `PATCH /api/v1/financial-movements/:id` con id inexistente → 404.
- `DELETE /api/v1/financial-movements/:id` exitoso → 204.

## Riesgos
- **Movimiento con `amount` Decimal**: el JSON retornado puede serializar `Decimal` como string en lugar de número. Mitigación: documentar el comportamiento y actualizar el cliente web para manejar ambos formatos.

## Documentación a actualizar
- `apps/api/src/modules/financial-movements/financial-movements.controller.ts` — handlers `create`, `update`, `remove` agregados.

## Decisiones clave
- **Mismo patrón que BankAccounts**: todos los módulos del dominio siguen el mismo patrón CRUD (POST/PATCH/DELETE) para facilitar el mantenimiento y la documentación de la API.
- **Principio de trazabilidad**: el soft-delete de movimientos financieros garantiza que el historial contable nunca se pierda, cumpliendo con principios de auditoría financiera.

## Evidencia documental
- `apps/api/src/modules/financial-movements/financial-movements.controller.ts`

## Pendientes para la siguiente task
- `T-1322` expone los endpoints CRUD de `Transfers`.

## Pendientes no resueltos
- Ninguno.
