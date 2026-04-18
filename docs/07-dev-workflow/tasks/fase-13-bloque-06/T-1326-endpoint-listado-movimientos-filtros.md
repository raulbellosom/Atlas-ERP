# T-1326 - Crear endpoint de listado de movimientos por filtros

## Metadatos
- ID: `T-1326`
- Fase: `Fase 13`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Exponer un endpoint explícito y semánticamente claro para consultar movimientos financieros por filtros, complementando el endpoint general de lista.

## Alcance
- Endpoint agregado en `FinancialMovementsController`:
  - `GET /api/v1/financial-movements/by-filters`
- Reutiliza `ListFinancialMovementsQueryDto` con todos sus filtros:
  - `organizationId`, `bankAccountId`, `branchId`, `createdById`
  - `movementType`, `status`, `isReconciled`
  - `from`, `to`, `limit`
- El endpoint general `GET /api/v1/financial-movements` se mantiene sin cambios.

## Fuera de alcance
- Paginación cursor-based (eso es Fase 14).
- Exportación de movimientos a CSV/Excel (Fase 14+).
- Filtros por tag o etiqueta de gasto (Fase 14+).

## Dependencias
- `T-1301`: `ListFinancialMovementsQueryDto` disponible.
- `T-1314`: `FinancialMovementsService.findAll()` implementado con filtros.

## Criterios de aceptación
- [x] Endpoint explícito de filtros disponible en `/by-filters`.
- [x] Se reutiliza el contrato DTO ya validado.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `GET /api/v1/financial-movements/by-filters?organizationId=X&from=2026-01-01&to=2026-04-30` → 200 con movimientos filtrados.
- `GET /api/v1/financial-movements/by-filters?movementType=INCOME` → solo movimientos de ingreso.
- `GET /api/v1/financial-movements/by-filters?isReconciled=true` → solo movimientos reconciliados.

## Riesgos
- **Ruta `/by-filters` vs. `/:id`**: NestJS podría interpretar `by-filters` como un valor de ID. Mitigación: registrar `/by-filters` antes de `/:id` en el controlador.
- **Filtro por rango de fechas con strings**: los parámetros de query `from` y `to` llegan como strings. El servicio debe convertirlos a `Date` para las queries Prisma.

## Documentación a actualizar
- `apps/api/src/modules/financial-movements/financial-movements.controller.ts` — handler `findByFilters` agregado.

## Decisiones clave
- **Ruta explícita `/by-filters`**: en lugar de hacer el endpoint general `GET /` más complejo, se expone una ruta semántica para filtrado. Esto hace la API más auto-descriptiva y facilita la implementación de caché diferenciado en el futuro.
- **Reutilización del DTO**: no se crea un nuevo DTO para `/by-filters` — se reutiliza `ListFinancialMovementsQueryDto` para mantener un único contrato de filtrado.

## Evidencia documental
- `apps/api/src/modules/financial-movements/financial-movements.controller.ts`

## Pendientes para la siguiente task
- `T-1327` agrega el endpoint de resumen de saldos por organización.

## Pendientes no resueltos
- Ninguno.
