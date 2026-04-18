# T-1331 - Integrar auditoría de acciones críticas del módulo

## Metadatos
- ID: `T-1331`
- Fase: `Fase 13`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Registrar trazabilidad de auditoría para todas las acciones críticas del módulo Financial Operations Core, garantizando que cualquier operación de creación, modificación, baja o acción operativa quede documentada en el log de auditoría del sistema.

## Alcance
- Integración de `AuditService` en los 6 servicios críticos del módulo:
  - `BankAccountsService`
  - `FinancialMovementsService`
  - `TransfersService`
  - `ReceivablesLiteService`
  - `PayablesLiteService`
  - `ReconciliationService`
- Eventos de auditoría registrados:
  - `create`, `update`, `softDelete` en todos los servicios anteriores.
  - `reconcile`, `close` en `ReconciliationService`.
  - `uploadProof` en `FinancialMovementsService`.
- Contexto mínimo por evento: `organizationId`, `entityType`, `entityId`, `action`, `result`.
- Módulos actualizados para importar `AuditModule`:
  - `BankAccountsModule`, `FinancialMovementsModule`, `TransfersModule`, `ReceivablesLiteModule`, `PayablesLiteModule`, `ReconciliationModule`.

## Fuera de alcance
- Auditoría de endpoints de solo lectura (GET) — solo se auditan escrituras y acciones operativas.
- Dashboard de auditoría (Fase 14+).
- Retención y archivado de logs de auditoría (infraestructura).

## Dependencias
- `T-1313` a `T-1319`: todos los servicios de escritura del módulo implementados.
- `T-1328`, `T-1329`: métodos operativos de conciliación implementados.
- `T-1330`: `uploadProof` implementado.
- `AuditModule`: módulo de auditoría existente en el backend.

## Criterios de aceptación
- [x] Acciones críticas del módulo generan evento de auditoría.
- [x] Se incluye contexto mínimo (`organizationId`, `entityType`, `entityId`, `result`).
- [x] Operaciones de conciliación y vínculo de comprobantes quedan auditadas.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- Ejecutar `POST /api/v1/bank-accounts` → verificar que se creó un registro de auditoría con `entityType: 'bank_account'` y `action: 'create'`.
- Ejecutar `DELETE /api/v1/financial-movements/:id` → verificar auditoría con `action: 'soft_delete'`.
- Ejecutar `POST /api/v1/reconciliation/sessions/:id/reconcile` → verificar auditoría con `action: 'reconcile'`.

## Riesgos
- **Auditoría sin `organizationId`**: algunos endpoints no reciben `organizationId` directamente (ej. update). El servicio debe derivarlo del objeto existente en BD. Mitigación: hacer `findOneById` antes de auditar si no viene en el DTO.
- **AuditService no bloquea la operación**: si `AuditService.log()` falla, la operación principal no debe revertirse. Mitigación: el `AuditService` internamente maneja sus errores sin propagar (fire-and-forget o try-catch interno).

## Documentación a actualizar
- `apps/api/src/modules/bank-accounts/bank-accounts.service.ts`
- `apps/api/src/modules/financial-movements/financial-movements.service.ts`
- `apps/api/src/modules/transfers/transfers.service.ts`
- `apps/api/src/modules/receivables-lite/receivables-lite.service.ts`
- `apps/api/src/modules/payables-lite/payables-lite.service.ts`
- `apps/api/src/modules/reconciliation/reconciliation.service.ts`
- Todos los `.module.ts` de los módulos anteriores — importar `AuditModule`.

## Decisiones clave
- **Auditoría post-operación**: `AuditService.log()` se llama después de que la operación en Prisma es exitosa. Si la operación falla, no se genera evento de auditoría (no hay nada que auditar).
- **`entityType` como string kebab-case**: consistente con el patrón del sistema de auditoría (`bank_account`, `financial_movement`, etc.) para facilitar filtrado en dashboards futuros.

## Evidencia documental
- `apps/api/src/modules/bank-accounts/bank-accounts.service.ts`
- `apps/api/src/modules/financial-movements/financial-movements.service.ts`
- `apps/api/src/modules/transfers/transfers.service.ts`
- `apps/api/src/modules/receivables-lite/receivables-lite.service.ts`
- `apps/api/src/modules/payables-lite/payables-lite.service.ts`
- `apps/api/src/modules/reconciliation/reconciliation.service.ts`
- Los 6 `.module.ts` correspondientes.

## Pendientes para la siguiente task
- `T-1332` aplica permisos en todos los controladores del módulo.

## Pendientes no resueltos
- Ninguno.
