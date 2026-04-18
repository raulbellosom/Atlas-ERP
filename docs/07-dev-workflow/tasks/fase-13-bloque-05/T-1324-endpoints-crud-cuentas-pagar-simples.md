# T-1324 - Crear endpoints CRUD de cuentas por pagar simples

## Metadatos
- ID: `T-1324`
- Fase: `Fase 13`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Exponer las operaciones CRUD base de cuentas por pagar simplificadas a través del controlador NestJS, conectando los DTOs de T-1312 y los métodos de servicio de T-1319 con la capa HTTP. Con este controlador quedan completos los 7 conjuntos de endpoints CRUD del dominio.

## Alcance
- Endpoints agregados en `PayablesLiteController`:
  - `POST /api/v1/payables-lite` → `service.create(dto)` (201)
  - `PATCH /api/v1/payables-lite/:id` → `service.update(id, dto)` (200)
  - `DELETE /api/v1/payables-lite/:id` → `service.softDelete(id)` (204)
- Endpoints de consulta existentes preservados:
  - `GET /api/v1/payables-lite`
  - `GET /api/v1/payables-lite/:id`
  - `GET /api/v1/payables-lite/organization/:organizationId/overdue-count`
- Manejo de `NotFoundException` propagada desde el servicio (retorna 404).

## Fuera de alcance
- Permisos y auditoría (eso es T-1331 y T-1332).

## Dependencias
- `T-1312`: `CreatePayableLiteDto` y `UpdatePayableLiteDto` disponibles.
- `T-1319`: `PayablesLiteService.create()`, `update()`, `softDelete()` implementados.

## Criterios de aceptación
- [x] CRUD base de `PayablesLite` expuesto en API.
- [x] Errores `404` en update/delete para IDs inexistentes.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `POST /api/v1/payables-lite` con body válido → 201.
- `PATCH /api/v1/payables-lite/:id` con id inexistente → 404.
- `DELETE /api/v1/payables-lite/:id` exitoso → 204.

## Riesgos
- **Mismo riesgo de ruta overdue-count**: registrar la ruta específica antes de `/:id`.

## Documentación a actualizar
- `apps/api/src/modules/payables-lite/payables-lite.controller.ts` — handlers `create`, `update`, `remove` agregados.

## Decisiones clave
- **7 módulos con CRUD completo**: con este controlador, los 7 módulos del dominio Financial Operations Core tienen endpoints CRUD operativos. El Bloque 6 agrega endpoints operativos especializados (balance, resumen, conciliación).

## Evidencia documental
- `apps/api/src/modules/payables-lite/payables-lite.controller.ts`

## Pendientes para la siguiente task
- `T-1325` (Bloque 6) agrega el endpoint de balance por cuenta bancaria.

## Pendientes no resueltos
- Ninguno.
