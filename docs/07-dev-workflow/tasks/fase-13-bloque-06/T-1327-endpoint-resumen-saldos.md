# T-1327 - Crear endpoint de resumen de saldos

## Metadatos
- ID: `T-1327`
- Fase: `Fase 13`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Exponer un endpoint de resumen de saldos por organización con agregación por moneda, diseñado para alimentar dashboards financieros con una sola consulta.

## Alcance
- Endpoint agregado en `BankAccountsController`:
  - `GET /api/v1/bank-accounts/organization/:organizationId/balance-summary`
- Query opcional:
  - `includeInactive: boolean` — incluir cuentas inactivas en el resumen (default: false).
- DTO agregado:
  - `BalanceSummaryQueryDto` con campo `includeInactive`.
- Método agregado en `BankAccountsService`:
  - `getBalanceSummaryByOrganization(organizationId, includeInactive)`.
- Respuesta con:
  - `totalAccounts`, `activeAccounts`, `totals: { [currencyCode]: number }`.

## Fuera de alcance
- Resumen por sucursal (Fase 14+).
- Resumen histórico comparativo (Fase 14+).

## Dependencias
- `T-1325`: `getBalanceByAccount` implementado en servicio.
- `T-1320`: endpoints CRUD de `BankAccounts` disponibles.

## Criterios de aceptación
- [x] Endpoint de resumen de saldos disponible.
- [x] Agregación por moneda implementada.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `GET /api/v1/bank-accounts/organization/:organizationId/balance-summary` → 200 con totales por moneda.
- Con `includeInactive=true` → incluye cuentas inactivas en el resumen.
- Sin `includeInactive` (default) → solo cuentas activas.
- Para organización sin cuentas → 200 con `totalAccounts: 0` y `totals: {}`.

## Riesgos
- **Ruta `organization/:organizationId/balance-summary` vs. otras rutas de organización**: el controlador ya tiene `organization/:organizationId/active-count`. Deben coexistir sin ambigüedad.
- **Agregación en memoria vs. SQL**: en v1, la agregación por moneda se hace en el servicio iterando las cuentas. Para organizaciones con muchas cuentas, esto puede ser lento. Mitigación: documentar el límite y planificar migración a SQL GROUP BY en Fase 14.

## Documentación a actualizar
- `apps/api/src/modules/bank-accounts/bank-accounts.controller.ts` — handler `getBalanceSummary` agregado.
- `apps/api/src/modules/bank-accounts/bank-accounts.service.ts` — método `getBalanceSummaryByOrganization` agregado.
- `apps/api/src/modules/bank-accounts/dto/balance-summary.query.dto.ts` — archivo nuevo.

## Decisiones clave
- **Endpoint de resumen dedicado**: en lugar de obtener la lista completa de cuentas y agregar en el cliente, el backend expone el resumen precalculado. Esto reduce el payload y simplifica la UI del dashboard.
- **Agregación por moneda**: una organización puede tener cuentas en MXN, USD, EUR, etc. El resumen agrupa los saldos por moneda para dar una vista consolidada sin mezclar divisas.

## Evidencia documental
- `apps/api/src/modules/bank-accounts/bank-accounts.controller.ts`
- `apps/api/src/modules/bank-accounts/bank-accounts.service.ts`
- `apps/api/src/modules/bank-accounts/dto/balance-summary.query.dto.ts`

## Pendientes para la siguiente task
- `T-1328` agrega el endpoint operativo de ejecución de conciliación.

## Pendientes no resueltos
- Ninguno.
