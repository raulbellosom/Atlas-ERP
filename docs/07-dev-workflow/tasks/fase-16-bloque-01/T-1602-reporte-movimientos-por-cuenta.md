# T-1602 - Crear reporte de movimientos por cuenta

## Metadatos
- ID: `T-1602`
- Fase: `Fase 16`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Implementar el reporte de movimientos financieros agrupado por cuenta bancaria, mostrando el detalle de transacciones de cada cuenta con saldo inicial, movimientos del periodo y saldo final estimado.

## Alcance
- Crear página `MovementsByAccountReportPage` en `/finops/reports/movements-by-account`:
  - Filtros: rango de fechas (obligatorio), selección de cuentas (multi-select, default: todas).
  - Una sección por cuenta bancaria con:
    - Header de cuenta: nombre, número (enmascarado), banco, moneda.
    - Saldo al inicio del periodo (del caché o del último snapshot disponible).
    - Tabla de movimientos del periodo ordenada cronológicamente.
    - Subtotales: total de ingresos, total de egresos, diferencia neta.
    - Saldo estimado al final del periodo (saldo inicial ± diferencia neta).
  - Totales globales al final del reporte: suma de diferencias netas por moneda.
  - Botones de exportación: CSV (una hoja por cuenta), XLSX (una pestaña por cuenta), PDF (sección por cuenta).
- Fuente: `GET /api/v1/financial-movements/by-filters` filtrado por `bankAccountId` para cada cuenta seleccionada.

## Fuera de alcance
- Estado de cuenta bancario oficial (formato del banco — Fase 17+).
- Conciliación embebida en el reporte (Fase 17+).

## Dependencias
- `T-1326`: endpoint de movimientos con filtros disponible.
- `T-1325`: endpoint de balance por cuenta disponible (para saldo inicial).
- `T-1601`: patrón de reporte de movimientos establecido.
- `T-1612`: `ReportFilterPanel` disponible.

## Criterios de aceptación
- [ ] Reporte con una sección por cuenta seleccionada.
- [ ] Saldo inicial, movimientos y saldo estimado final correctos.
- [ ] Exportación a CSV, XLSX y PDF con estructura por cuenta.
- [ ] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: seleccionar 2 cuentas + mes → dos secciones con datos correctos → exportar XLSX → dos pestañas.

## Pruebas
- Seleccionar cuenta "Principal" en enero → sección con movimientos + totales correctos.
- Exportar XLSX con 3 cuentas → 3 pestañas en el archivo.
- Sin cuentas seleccionadas → muestra todas las cuentas activas.

## Riesgos
- **Saldo inicial no disponible en algunos periodos**: si no hay snapshot para el inicio del periodo, el saldo inicial se muestra como "N/D". El saldo estimado final también se muestra como "N/D".

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/reports/MovementsByAccountReportPage.jsx` — archivo nuevo.

## Decisiones clave
- **Saldo estimado, no oficial**: el "saldo final" del reporte es una estimación (saldo inicial ± movimientos del periodo). No reemplaza el saldo oficial del banco. Se etiqueta explícitamente como "estimado".

## Evidencia documental
- `apps/web/src/modules/finops/pages/reports/MovementsByAccountReportPage.jsx`

## Pendientes para la siguiente task
- `T-1603` implementa el reporte de saldos por cuenta y resumen global.

## Pendientes no resueltos
- Ninguno.
