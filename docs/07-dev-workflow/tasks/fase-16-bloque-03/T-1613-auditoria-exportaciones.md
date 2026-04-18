# T-1613 - Crear auditoría de exportaciones si aplica

## Metadatos
- ID: `T-1613`
- Fase: `Fase 16`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Registrar en el sistema de auditoría las exportaciones e impresiones de reportes financieros, permitiendo al administrador saber quién exportó qué información y cuándo.

## Alcance
- Definir si aplica auditoría de exportaciones en v1:
  - **Aplica**: los reportes financieros contienen información sensible (saldos, movimientos, CxC/CxP). Saber quién los exportó es relevante para compliance.
  - **Alcance mínimo**: auditar las exportaciones de PDF y XLSX (las más completas). CSV puede auditarse también para uniformidad.
- Implementar la auditoría del lado del **frontend** (no del backend):
  - Al hacer clic en "Exportar PDF/XLSX/CSV" o "Imprimir": llamar a `POST /api/v1/audit/log` con:
    - `action: 'REPORT_EXPORTED'`.
    - `entityType: 'FinOpsReport'`.
    - `entityId`: nombre del reporte (ej. `'MovementsReport'`).
    - `metadata`: `{ format: 'PDF'|'XLSX'|'CSV'|'PRINT', filters: { from, to, accounts, types }, rowCount: number }`.
  - Fire-and-forget: la auditoría no bloquea la exportación si falla.
- Crear hook `useReportAudit()` que encapsula la llamada de auditoría.
- Integrar `useReportAudit` en todas las funciones de exportación.

## Fuera de alcance
- Panel de auditoría de exportaciones en la UI (el admin ve los eventos en el módulo de auditoría general).
- Auditoría del lado del backend para exportaciones (el frontend es el que genera el archivo — el backend no sabe qué datos se exportaron).

## Dependencias
- `T-1331`: `AuditService` del backend disponible y endpoint `POST /api/v1/audit/log` operativo.
- `T-1607` a `T-1609`: funciones de exportación donde se integra.
- `T-1610` / `T-1611`: funciones de impresión.

## Criterios de aceptación
- [ ] `useReportAudit()` implementado y funcional.
- [ ] Evento `REPORT_EXPORTED` registrado al exportar cualquier reporte en cualquier formato.
- [ ] La auditoría no bloquea la exportación si el endpoint falla.
- [ ] `pnpm --filter @atlasrep/web run typecheck`: sin errores.

## Validaciones
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: exportar un reporte → verificar en el log de auditoría (tabla de la BD) que el evento fue registrado con el formato y filtros correctos.

## Pruebas
- Exportar PDF de movimientos → evento `REPORT_EXPORTED` en BD con `format: 'PDF'`, `entityId: 'MovementsReport'`, `rowCount: N`.
- Endpoint de auditoría falla (500) → exportación continúa igual, sin error en la UI.
- Imprimir comprobante de movimiento → evento `REPORT_EXPORTED` con `format: 'PRINT'`.

## Riesgos
- **Privacidad de los filtros en metadata**: los filtros del reporte (rango de fechas, cuentas seleccionadas) se guardan en `metadata`. Si los nombres de cuentas contienen información sensible, evaluar si guardar solo los IDs en lugar de los nombres.

## Documentación a actualizar
- `apps/web/src/modules/finops/hooks/useReportAudit.ts` — archivo nuevo.

## Decisiones clave
- **Auditoría en frontend, no en backend**: el backend no genera los archivos de exportación (la generación es client-side). Por tanto, solo el frontend sabe que una exportación ocurrió y qué datos incluyó. El evento de auditoría se envía desde el frontend tras generar el archivo.
- **Fire-and-forget**: la auditoría no debe bloquear una exportación. Si el endpoint de audit falla, el usuario recibe igualmente su archivo. El log de auditoría es importante pero no crítico para la operación.

## Evidencia documental
- `apps/web/src/modules/finops/hooks/useReportAudit.ts`

## Pendientes para la siguiente task
- `T-1614` valida el rendimiento de los reportes con datos reales.

## Pendientes no resueltos
- Ninguno.
