# T-1301 - Crear módulo backend FinancialMovements

## Metadatos
- ID: `T-1301`
- Fase: `Fase 13`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Configurar el módulo backend `FinancialMovements` en NestJS para exponer consultas base de movimientos financieros (ingresos, egresos, transferencias). Este módulo es el núcleo operativo del módulo Financial Operations Core.

## Alcance
- Crear `FinancialMovementsModule`, `FinancialMovementsController`, `FinancialMovementsService`.
- Crear `ListFinancialMovementsQueryDto` con filtros de organización, cuenta, tipo de movimiento, estatus y rango de fechas.
- Exponer rutas:
  - `GET /api/v1/financial-movements`
  - `GET /api/v1/financial-movements/:id`
- Integrar módulo en `AppModule`.
- Implementar consultas base con Prisma (findAll con filtros, findOneById).

## Fuera de alcance
- Endpoints de creación, actualización y eliminación (eso es T-1314 y T-1321).
- Endpoint de filtros explícito (eso es T-1326).
- Uploads de comprobantes (eso es T-1330).
- DTOs de escritura (eso es T-1308).
- Permisos y auditoría (eso es T-1331 y T-1332).

## Dependencias
- `T-1300`: `BankAccountsModule` debe estar creado antes (referencia de FK).
- `T-1200` a `T-1222` (Fase 12): modelos Prisma `FinancialMovement` y enums de tipo/estatus deben estar aplicados.

## Criterios de aceptación
- [x] Módulo backend `financial-movements` creado e integrado en `AppModule`.
- [x] Consultas base con Prisma implementadas (findAll, findOneById).
- [x] DTO de filtros base funcional (`ListFinancialMovementsQueryDto`).
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `GET /api/v1/financial-movements` — responde con array (vacío o con datos demo).
- `GET /api/v1/financial-movements/:id` — responde con objeto o 404.
- Filtros por `movementType`, `status`, `from`, `to` — reducen correctamente el resultado.

## Riesgos
- **Enums no disponibles en cliente Prisma**: si `FinancialMovementType` y `FinancialMovementStatus` no están generados, el DTO no puede validar enums válidos. Mitigación: ejecutar `db:generate` antes de compilar.
- **Filtros de fecha mal construidos**: el DTO debe convertir strings ISO a `Date` antes de construir la query Prisma. Mitigación: usar transformadores `@Type(() => Date)` de `class-transformer`.

## Documentación a actualizar
- `apps/api/src/app.module.ts` — importar `FinancialMovementsModule`.

## Decisiones clave
- **Filtros por rango de fechas en DTO base**: aunque los endpoints CRUD se agregan en bloques posteriores, el DTO de consulta ya incluye filtros temporales porque el contexto financiero siempre requiere rango de fechas para operatividad.
- **findAll sin paginación en v1**: la primera versión devuelve la lista completa con un `limit` opcional para evitar sobre-ingeniería en el MVP.

## Evidencia documental
- `apps/api/src/modules/financial-movements/financial-movements.module.ts`
- `apps/api/src/modules/financial-movements/financial-movements.controller.ts`
- `apps/api/src/modules/financial-movements/financial-movements.service.ts`
- `apps/api/src/modules/financial-movements/dto/list-financial-movements-query.dto.ts`

## Pendientes para la siguiente task
- `T-1302` crea el módulo `Transfers` con el mismo patrón.

## Pendientes no resueltos
- Ninguno.
