# T-1509 - Crear enqueue local de CxC/CxP simples offline

## Metadatos
- ID: `T-1509`
- Fase: `Fase 15`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Implementar el flujo de creación de cuentas por cobrar (ReceivableLite) y cuentas por pagar (PayableLite) en modo offline, encolando las operaciones para sincronización posterior y reflejando los registros en el caché local con indicador de pendiente.

## Alcance
- Crear `useCreateReceivableDesktop()` mutation hook:
  - Online: `POST /api/v1/receivables-lite` directamente.
  - Offline: UUID local → encola en `finops_sync_queue` con `entityType: 'receivable'`, `operation: 'create'` → inserta en `finops_cxc_cache` con `status: 'PENDING_SYNC'`.
- Crear `useCreatePayableDesktop()` mutation hook (patrón idéntico para `payable`).
- Handlers en el Sync Core:
  - `finops-receivable-create.handler.ts` → `POST /api/v1/receivables-lite` + actualización de caché.
  - `finops-payable-create.handler.ts` → `POST /api/v1/payables-lite` + actualización de caché.
- Integrar hooks en `CreateReceivableFormDesktop` y `CreatePayableFormDesktop`.
- KPI "Vencidas" en offline: mostrar `N/D` (endpoint de conteo no disponible offline — T-1501).

## Fuera de alcance
- Edición o eliminación de CxC/CxP offline (no permitido).
- KPI de vencidas en offline (muestra N/D).
- Cambio de estatus de CxC/CxP offline (PENDING → PAID etc. — no permitido).

## Dependencias
- `T-1502`: tablas `finops_cxc_cache` y `finops_cxp_cache` disponibles.
- `T-1507` / `T-1508`: patrón de enqueue establecido — se replica.
- `T-1418`: páginas `ReceivablesPage` / `PayablesPage` web como base.
- `T-1506`: formularios desktop disponibles.

## Criterios de aceptación
- [x] `useCreateReceivableDesktop` implementado en `apps/desktop/src/modules/finops/hooks/useCreateReceivableDesktop.js`.
- [x] `useCreatePayableDesktop` implementado en `apps/desktop/src/modules/finops/hooks/useCreatePayableDesktop.js`.
- [x] Handlers `finopsReceivableCreateHandler` y `finopsPayableCreateHandler` creados en `apps/desktop/src/modules/finops/sync/`.
- [x] KPI "Vencidas" retorna `null` offline — las páginas deben mostrar `N/D` (definido en contrato T-1501).
- [x] `pnpm --filter @atlasrep/desktop run lint`: 0 errores.

## Validaciones
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.
- Revisión manual: offline → crear CxC → visible en lista → reconectar → sync → id real asignado.

## Pruebas
- Offline: crear CxC con contraparte, monto y vencimiento → aparece en lista con `PENDING_SYNC`.
- Reconectar → `POST /api/v1/receivables-lite` llamado → id real asignado → badge desaparece.
- KPI "Vencidas" offline → muestra "N/D" con tooltip "Disponible solo con conexión".
- Error de validación en sync → item en cola con `ERROR` → usuario puede reintentar o descartar.

## Riesgos
- **Fecha de vencimiento en zona horaria local**: `dueDate` se guarda en el formulario desktop como fecha local. Al sincronizar, debe enviarse en UTC para consistencia con el backend. Mitigación: normalizar a UTC al encolar el payload.

## Documentación a actualizar
- `apps/desktop/src/modules/finops/hooks/useCreateReceivableDesktop.ts` — archivo nuevo.
- `apps/desktop/src/modules/finops/hooks/useCreatePayableDesktop.ts` — archivo nuevo.
- `apps/desktop/src/modules/finops/sync/finops-receivable-create.handler.ts` — archivo nuevo.
- `apps/desktop/src/modules/finops/sync/finops-payable-create.handler.ts` — archivo nuevo.

## Decisiones clave
- **Patrón idéntico para CxC y CxP**: ambas entidades son simétricas (mismo schema, mismos endpoints, mismo flujo). Se implementan juntas para evitar duplicación innecesaria de trabajo. Los handlers son distintos pero comparten la misma lógica base.
- **KPI N/D en offline**: el contador de vencidas requiere un cálculo del servidor. En offline, mostrarlo como `N/D` es más honesto que mostrar un valor calculado localmente que podría divergir del real.

## Evidencia documental
- `apps/desktop/src/modules/finops/hooks/useCreateReceivableDesktop.ts`
- `apps/desktop/src/modules/finops/hooks/useCreatePayableDesktop.ts`
- `apps/desktop/src/modules/finops/sync/finops-receivable-create.handler.ts`
- `apps/desktop/src/modules/finops/sync/finops-payable-create.handler.ts`

## Pendientes para la siguiente task
- `T-1510` (Bloque 3) implementa la visualización de ítems pendientes en el Sync Center.

## Pendientes no resueltos
- Ninguno.
