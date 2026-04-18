# T-1320 - Crear endpoints CRUD de cuentas bancarias

## Metadatos
- ID: `T-1320`
- Fase: `Fase 13`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Exponer las operaciones CRUD base de cuentas bancarias a través del controlador NestJS, conectando los DTOs de T-1307 y los métodos de servicio de T-1313 con la capa HTTP.

## Alcance
- Endpoints agregados en `BankAccountsController`:
  - `POST /api/v1/bank-accounts` → `service.create(dto)`
  - `PATCH /api/v1/bank-accounts/:id` → `service.update(id, dto)`
  - `DELETE /api/v1/bank-accounts/:id` → `service.softDelete(id)` (retorna 204)
- Endpoints de consulta existentes preservados:
  - `GET /api/v1/bank-accounts`
  - `GET /api/v1/bank-accounts/:id`
  - `GET /api/v1/bank-accounts/organization/:organizationId/active-count`
- Manejo de `NotFoundException` propagada desde el servicio (retorna 404).
- Decorador `@Body()` con `ValidationPipe` para crear/actualizar.

## Fuera de alcance
- Endpoints de balance (eso es T-1325 y T-1327).
- Permisos (eso es T-1332).
- Auditoría (eso es T-1331).

## Dependencias
- `T-1307`: `CreateBankAccountDto` y `UpdateBankAccountDto` disponibles.
- `T-1313`: `BankAccountsService.create()`, `update()`, `softDelete()` implementados.

## Criterios de aceptación
- [x] CRUD base de `BankAccounts` expuesto en API.
- [x] Errores `404` en update/delete para IDs inexistentes.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `POST /api/v1/bank-accounts` con body válido → 201 + objeto creado.
- `POST /api/v1/bank-accounts` con body inválido → 400.
- `PATCH /api/v1/bank-accounts/:id` con id inexistente → 404.
- `DELETE /api/v1/bank-accounts/:id` con id inexistente → 404.
- `DELETE /api/v1/bank-accounts/:id` exitoso → 204 sin body.

## Riesgos
- **DELETE retorna 200 vs. 204**: si el servicio retorna el objeto eliminado, el controlador podría retornar 200 con body. El patrón del proyecto es retornar 204 sin body para soft-delete. Mitigación: usar `@HttpCode(HttpStatus.NO_CONTENT)` en el handler DELETE.

## Documentación a actualizar
- `apps/api/src/modules/bank-accounts/bank-accounts.controller.ts` — handlers `create`, `update`, `remove` agregados.

## Decisiones clave
- **`PATCH` sobre `PUT`**: se usa `PATCH` para actualización parcial porque `UpdateBankAccountDto` tiene todos los campos opcionales. `PUT` requeriría cuerpo completo.
- **DELETE como soft-delete**: el endpoint `DELETE` no elimina físicamente el registro, sino que ejecuta `softDelete()`. Esto es transparente para el cliente HTTP (retorna 204), pero mantiene el historial en base de datos.

## Evidencia documental
- `apps/api/src/modules/bank-accounts/bank-accounts.controller.ts`

## Pendientes para la siguiente task
- `T-1321` expone los endpoints CRUD de `FinancialMovements`.

## Pendientes no resueltos
- Ninguno.
