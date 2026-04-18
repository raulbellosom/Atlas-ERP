# T-1605 - Crear reporte de cuentas por cobrar simples

## Metadatos
- ID: `T-1605`
- Fase: `Fase 16`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Implementar el reporte de cuentas por cobrar (ReceivablesLite) con KPIs de cartera, aging (antigüedad de deuda), detalle por contraparte y exportación.

## Alcance
- Crear página `ReceivablesReportPage` en `/finops/reports/receivables`:
  - KPIs en el header (cards):
    - Total por cobrar (todas las PENDING).
    - Total vencidas (dueDate < hoy).
    - Total por vencer en los próximos 30 días.
    - Porcentaje de cartera vencida.
  - Tabla aging por contraparte:
    - Filas: una por contraparte.
    - Columnas: nombre contraparte, corriente (no vencida), 1-30 días vencida, 31-60 días, 61-90 días, +90 días, total.
  - Tabla de detalle: igual que `ReceivablesPage` pero con todos los filtros para reporte.
  - Filtros: estatus, rango de vencimiento, contraparte, moneda.
  - Exportación: CSV, XLSX, PDF.
- Fuente: `GET /api/v1/receivables-lite` + cálculo de aging en frontend.

## Fuera de alcance
- Integración con módulo de facturación real (Fase 17+).
- Proyección de flujo de caja (Fase 17+).
- Aging automático recalculado por el backend (Fase 17+).

## Dependencias
- `T-1305`: endpoint `GET /api/v1/receivables-lite` disponible.
- `T-1418`: `ReceivablesPage` como referencia de UI.
- `T-1612`: `ReportFilterPanel` disponible.
- `T-1607` a `T-1609`: exportaciones disponibles.

## Criterios de aceptación
- [ ] KPIs de cartera correctos con datos demo.
- [ ] Tabla aging por contraparte calculada correctamente.
- [ ] Detalle completo con filtros funcionales.
- [ ] Exportación a CSV, XLSX y PDF funcional.
- [ ] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: con datos demo → KPIs correctos → aging muestra CxC vencidas en columna correcta.

## Pruebas
- CxC con vencimiento de hace 45 días → aparece en columna "31-60 días".
- KPI "Cartera vencida %": (vencidas / total) × 100 = valor correcto.
- Filtrar solo moneda USD → tabla y KPIs solo con CxC en USD.
- Exportar XLSX → columnas de aging con valores correctos.

## Riesgos
- **Cálculo de aging en frontend**: el aging se calcula en el frontend como `(today - dueDate).days`. Si hay muchos registros (> 1,000 CxC), el cálculo puede ser lento. Mitigación: usar `useMemo` para no recalcular en cada render.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/reports/ReceivablesReportPage.jsx` — archivo nuevo.

## Decisiones clave
- **Aging en buckets estándar**: los buckets de aging (corriente, 1-30, 31-60, 61-90, +90) son el estándar contable para análisis de cartera. Permiten identificar rápidamente el riesgo de incobrabilidad por antigüedad.
- **KPIs en el header siempre visibles**: los 4 KPIs se calculan sobre todos los registros sin importar el filtro activo. Los filtros afectan solo la tabla de detalle y la tabla de aging.

## Evidencia documental
- `apps/web/src/modules/finops/pages/reports/ReceivablesReportPage.jsx`

## Pendientes para la siguiente task
- `T-1606` implementa el reporte simétrico de cuentas por pagar.

## Pendientes no resueltos
- Ninguno.
