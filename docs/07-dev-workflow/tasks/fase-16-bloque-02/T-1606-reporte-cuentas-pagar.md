# T-1606 - Crear reporte de cuentas por pagar simples

## Metadatos
- ID: `T-1606`
- Fase: `Fase 16`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Implementar el reporte de cuentas por pagar (PayablesLite) simétrico al de CxC, con KPIs de pasivos, aging de obligaciones vencidas, tabla por proveedor y exportación.

## Alcance
- Crear página `PayablesReportPage` en `/finops/reports/payables`:
  - KPIs en header:
    - Total por pagar (PENDING).
    - Total vencido (dueDate < hoy).
    - Total por vencer en los próximos 30 días.
    - Porcentaje de pasivos vencidos.
  - Tabla aging por proveedor (contraparte):
    - Mismos buckets que CxC: corriente, 1-30, 31-60, 61-90, +90 días.
  - Tabla de detalle con filtros: estatus, vencimiento, contraparte, moneda.
  - Exportación: CSV, XLSX, PDF.
- Fuente: `GET /api/v1/payables-lite` + cálculo de aging en frontend.
- Reutilizar la lógica de aging desarrollada en T-1605.

## Fuera de alcance
- Integración con proveedores reales (Fase 17+).
- Planificación de pagos (Fase 17+).

## Dependencias
- `T-1306`: endpoint `GET /api/v1/payables-lite` disponible.
- `T-1605`: lógica de aging y componentes reutilizables de CxC disponibles.
- `T-1612`: `ReportFilterPanel` disponible.

## Criterios de aceptación
- [ ] `PayablesReportPage` con KPIs, aging y detalle correctos.
- [ ] Reutilización del componente de aging de T-1605.
- [ ] Exportación a CSV, XLSX y PDF funcional.
- [ ] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: datos demo → KPIs y aging correctos → exportar PDF.

## Pruebas
- Aging de CxP con vencimiento de hace 95 días → columna "+90 días".
- KPI "Pasivos vencidos %": correcto.
- Exportar CSV → encabezados en español, datos correctos.

## Riesgos
- **Componente de aging compartido**: si el componente de aging de T-1605 no es parametrizable (CxC vs CxP), habrá duplicación. Mitigación: al implementar T-1605, hacer el componente genérico con prop `entityType`.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/reports/PayablesReportPage.jsx` — archivo nuevo.
- `apps/web/src/modules/finops/components/reports/AgingTable.jsx` — componente reutilizable (si no se creó en T-1605).

## Decisiones clave
- **Patrón idéntico a CxC**: los reportes de CxC y CxP son simétricos. El componente de aging es el mismo con datos diferentes. Esto reduce el código a mantener y garantiza consistencia visual entre ambos reportes.

## Evidencia documental
- `apps/web/src/modules/finops/pages/reports/PayablesReportPage.jsx`

## Pendientes para la siguiente task
- `T-1607` implementa la exportación CSV de movimientos.

## Pendientes no resueltos
- Ninguno.
