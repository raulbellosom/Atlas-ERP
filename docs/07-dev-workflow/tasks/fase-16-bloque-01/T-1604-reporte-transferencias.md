# T-1604 - Crear reporte de transferencias

## Metadatos
- ID: `T-1604`
- Fase: `Fase 16`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Implementar el reporte de transferencias bancarias del periodo, mostrando el detalle de cada transferencia con sus cuentas de origen y destino, estatus, monto y trazabilidad de aprobación.

## Alcance
- Crear página `TransfersReportPage` en `/finops/reports/transfers`:
  - Filtros: rango de fechas, cuenta origen (opcional), cuenta destino (opcional), estatus (PENDING/APPROVED/REJECTED).
  - Tabla de resultados:
    - Fecha, cuenta origen (nombre + número enmascarado), cuenta destino (nombre + número enmascarado), monto, moneda, estatus (badge), referencia/notas.
  - Sección de totales: monto total transferido por moneda, count por estatus.
  - Exportación: CSV, XLSX, PDF.
- Fuente: `GET /api/v1/transfers` con filtros de fecha y estatus.

## Fuera de alcance
- Detalle de los movimientos de doble partida (TRANSFER_IN/OUT) por transferencia (visible en T-1413 — detalle individual).
- Reporte de transferencias inter-empresa (módulo futuro).

## Dependencias
- `T-1302`: endpoint `GET /api/v1/transfers` disponible.
- `T-1600`: catálogo de reportes definido.
- `T-1612`: `ReportFilterPanel` disponible.
- `T-1607` a `T-1609`: exportaciones disponibles.

## Criterios de aceptación
- [ ] `TransfersReportPage` con tabla y totales correctos.
- [ ] Filtros por cuenta origen/destino y estatus funcionales.
- [ ] Exportación a CSV, XLSX y PDF funcional.
- [ ] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: filtrar transferencias APPROVED del mes → tabla con datos correctos → total transferido correcto.

## Pruebas
- Filtrar solo APPROVED → tabla solo con transferencias aprobadas.
- Filtrar por cuenta origen "Principal" → solo transferencias desde esa cuenta.
- Exportar XLSX → columnas con nombres de cuenta legibles (no solo IDs).

## Riesgos
- **Nombres de cuentas en el export**: las transferencias en el API incluyen `fromAccountId`/`toAccountId` (UUIDs). El reporte debe resolver los nombres de cuenta. Mitigación: hacer join con el caché de cuentas disponible en el frontend antes de exportar.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/reports/TransfersReportPage.jsx` — archivo nuevo.

## Decisiones clave
- **Totales solo para APPROVED**: el total de monto transferido del periodo se calcula solo sobre las transferencias con estatus APPROVED. Las PENDING y REJECTED se muestran en la tabla pero no se suman al total, para reflejar el dinero efectivamente movido.

## Evidencia documental
- `apps/web/src/modules/finops/pages/reports/TransfersReportPage.jsx`

## Pendientes para la siguiente task
- `T-1605` (Bloque 2) implementa el reporte de cuentas por cobrar.

## Pendientes no resueltos
- Ninguno.
