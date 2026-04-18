# T-1303 - Crear módulo backend Reconciliation

## Metadatos
- ID: `T-1303`
- Fase: `Fase 13`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Configurar el módulo backend `Reconciliation` en NestJS para exponer consultas base de sesiones e ítems de conciliación bancaria. Este módulo soporta el flujo de cierre contable y verificación de saldos.

## Alcance
- Crear `ReconciliationModule`, `ReconciliationController`, `ReconciliationService`.
- Crear DTOs:
  - `ListReconciliationSessionsQueryDto`
  - `ListReconciliationItemsQueryDto`
- Exponer rutas:
  - `GET /api/v1/reconciliation/sessions`
  - `GET /api/v1/reconciliation/sessions/:id`
  - `GET /api/v1/reconciliation/sessions/:id/items`
- Integrar módulo en `AppModule`.
- Implementar consultas base con Prisma (findSessions, findSessionById, findSessionItems).

## Fuera de alcance
- Endpoints de creación de sesiones e ítems (eso es T-1316 y T-1310).
- Endpoint operativo de conciliación (eso es T-1328).
- Endpoints de cierre y aprobación (eso es T-1329).
- Permisos y auditoría (eso es T-1331 y T-1332).

## Dependencias
- `T-1300`: `BankAccountsModule` creado (sesión de conciliación referencia una cuenta bancaria).
- `T-1200` a `T-1222` (Fase 12): modelos Prisma `ReconciliationSession`, `ReconciliationItem` y enums de estatus deben estar aplicados.

## Criterios de aceptación
- [x] Módulo backend `reconciliation` creado e integrado en `AppModule`.
- [x] Consultas base de sesiones e ítems implementadas con Prisma.
- [x] DTOs de filtros base funcionales.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `GET /api/v1/reconciliation/sessions` — responde con array (vacío o con datos demo).
- `GET /api/v1/reconciliation/sessions/:id` — responde con objeto o 404.
- `GET /api/v1/reconciliation/sessions/:id/items` — responde con array de ítems de la sesión.

## Riesgos
- **Anidamiento de rutas**: el prefijo `/reconciliation/sessions/:id/items` requiere diseño cuidadoso en el controlador para evitar conflictos con rutas planas. Mitigación: usar `@Get('sessions/:id/items')` explícito.
- **Session con muchos ítems**: una sesión de conciliación puede tener cientos de ítems. Mitigación: el DTO de ítems incluye `limit` para paginación básica.

## Documentación a actualizar
- `apps/api/src/app.module.ts` — importar `ReconciliationModule`.

## Decisiones clave
- **Separación sesión/ítems en endpoints distintos**: la sesión y sus ítems se consultan por separado para optimizar carga en interfaces que muestran solo el resumen (sin ítems) vs. el detalle completo.
- **Módulo de solo lectura en Bloque 1**: los endpoints operativos se agregan en bloques posteriores.

## Evidencia documental
- `apps/api/src/modules/reconciliation/reconciliation.module.ts`
- `apps/api/src/modules/reconciliation/reconciliation.controller.ts`
- `apps/api/src/modules/reconciliation/reconciliation.service.ts`
- `apps/api/src/modules/reconciliation/dto/list-reconciliation-sessions-query.dto.ts`
- `apps/api/src/modules/reconciliation/dto/list-reconciliation-items-query.dto.ts`

## Pendientes para la siguiente task
- `T-1304` crea el módulo `BalanceSnapshots` con el mismo patrón.

## Pendientes no resueltos
- Ninguno.
