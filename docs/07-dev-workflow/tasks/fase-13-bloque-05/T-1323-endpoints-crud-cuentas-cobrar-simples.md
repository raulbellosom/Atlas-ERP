# T-1323 - Crear endpoints CRUD de cuentas por cobrar simples

## Metadatos
- ID: `T-1323`
- Fase: `Fase 13`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Exponer las operaciones CRUD base de cuentas por cobrar simplificadas a través del controlador NestJS, conectando los DTOs de T-1311 y los métodos de servicio de T-1318 con la capa HTTP.

## Alcance
- Endpoints agregados en `ReceivablesLiteController`:
  - `POST /api/v1/receivables-lite` → `service.create(dto)` (201)
  - `PATCH /api/v1/receivables-lite/:id` → `service.update(id, dto)` (200)
  - `DELETE /api/v1/receivables-lite/:id` → `service.softDelete(id)` (204)
- Endpoints de consulta existentes preservados:
  - `GET /api/v1/receivables-lite`
  - `GET /api/v1/receivables-lite/:id`
  - `GET /api/v1/receivables-lite/organization/:organizationId/overdue-count`
- Manejo de `NotFoundException` propagada desde el servicio (retorna 404).

## Fuera de alcance
- Permisos y auditoría (eso es T-1331 y T-1332).
- Integración con módulo de cobros/pagos (Fase 14+).

## Dependencias
- `T-1311`: `CreateReceivableLiteDto` y `UpdateReceivableLiteDto` disponibles.
- `T-1318`: `ReceivablesLiteService.create()`, `update()`, `softDelete()` implementados.

## Criterios de aceptación
- [x] CRUD base de `ReceivablesLite` expuesto en API.
- [x] Errores `404` en update/delete para IDs inexistentes.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `POST /api/v1/receivables-lite` con body válido → 201.
- `PATCH /api/v1/receivables-lite/:id` con id inexistente → 404.
- `DELETE /api/v1/receivables-lite/:id` exitoso → 204.
- `GET /api/v1/receivables-lite/organization/:organizationId/overdue-count` — sigue funcionando.

## Riesgos
- **Ruta overdue-count vs. /:id**: el controlador debe registrar la ruta específica `/organization/:organizationId/overdue-count` antes de `/:id` para evitar que NestJS interprete `organization` como un id.

## Documentación a actualizar
- `apps/api/src/modules/receivables-lite/receivables-lite.controller.ts` — handlers `create`, `update`, `remove` agregados.

## Decisiones clave
- **Mismo patrón CRUD para CxC**: consistencia con el resto de módulos del dominio.

## Evidencia documental
- `apps/api/src/modules/receivables-lite/receivables-lite.controller.ts`

## Pendientes para la siguiente task
- `T-1324` expone los endpoints CRUD de `PayablesLite`.

## Pendientes no resueltos
- Ninguno.
