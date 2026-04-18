# 16 - Catálogo de reportes FinOps v1

**Referencia**: Task T-1600 (Fase 16 Bloque 1)
**Estado**: Aprobado

---

## Decisión de arquitectura: generación client-side

Los reportes v1 se generan en el **cliente** (navegador / Tauri) procesando los datos ya disponibles vía react-query. No se crean endpoints de reporte dedicados en el backend para v1.

**Justificación**:
- Iteración rápida sin tocar el backend.
- Los datos necesarios ya existen en los endpoints operativos (`/financial-movements`, `/transfers`, `/bank-accounts`, etc.).
- El volumen esperado en v1 (< 5 000 registros por reporte) es manejable en el cliente.
- Si en v2 se necesitan reportes de gran volumen o programados, se agrega un endpoint dedicado.

**Límite**: advertencia de UI si el resultado supera 5 000 filas.

---

## Catálogo de reportes v1

| # | Nombre | Ruta | Entidad origen | Filtros | Formatos |
|---|--------|------|---------------|---------|---------|
| 1 | Movimientos por rango | `/financial-operations/reports/movements` | `financial_movements` | Fecha (rango), cuenta, tipo, estatus, moneda | CSV, XLSX, PDF |
| 2 | Movimientos por cuenta | `/financial-operations/reports/movements-by-account` | `financial_movements` + `bank_accounts` | Fecha (rango), cuentas (multi-select) | CSV, XLSX, PDF |
| 3 | Saldos por cuenta | `/financial-operations/reports/balances` | `bank_accounts` + `balance_snapshots` | Cuentas, fecha | CSV, XLSX, PDF |
| 4 | Transferencias | `/financial-operations/reports/transfers` | `transfers` | Fecha (rango), cuenta origen, cuenta destino, estatus | CSV, XLSX, PDF |
| 5 | Cuentas por cobrar | `/financial-operations/reports/receivables` | `receivable_lites` | Fecha vencimiento, estatus, contraparte | CSV, XLSX, PDF |
| 6 | Cuentas por pagar | `/financial-operations/reports/payables` | `payable_lites` | Fecha vencimiento, estatus, contraparte | CSV, XLSX, PDF |

---

## Campos comunes a todos los reportes

| Campo | Descripción |
|-------|-------------|
| `organizationId` | Organización del usuario autenticado |
| `generatedAt` | Timestamp ISO 8601 de generación del reporte |
| `generatedBy` | Nombre completo y email del usuario que generó el reporte |
| `periodo` | Rango de fechas aplicado (si corresponde) |
| `filters` | Resumen de los filtros activos al momento de la exportación |

---

## Formatos de exportación soportados en v1

| Formato | Librería | Notas |
|---------|----------|-------|
| CSV | Nativo (string builder) | BOM UTF-8 (`\uFEFF`) para compatibilidad con Excel en Windows |
| XLSX | `exceljs` | Estilos básicos: header en negrita, columnas auto-width |
| PDF | `@react-pdf/renderer` | Layout portrait A4, logo + metadatos en header |

## Formatos excluidos de v1

- OFX / QIF (importación bancaria — Fase 17+)
- XML estructurado (integración ERP externo — Fase 17+)
- JSON estructurado (API de reportes — Fase 17+)
- Reportes programados / por email (Fase 17+)
