# T-1609 - Crear exportación PDF de listados clave

## Metadatos
- ID: `T-1609`
- Fase: `Fase 16`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Implementar la exportación a PDF de los reportes principales del módulo FinOps, con encabezado corporativo, datos de la organización y formato de impresión profesional.

## Alcance
- Usar `@react-pdf/renderer` para generación de PDF en el cliente:
  - Instalar: `pnpm add @react-pdf/renderer --filter @atlasrep/web`.
- Crear componentes PDF base en `apps/web/src/modules/finops/utils/pdf/`:
  - `ReportHeader.tsx` — encabezado con: nombre de la organización, nombre del reporte, periodo, fecha de generación, generado por (usuario actual).
  - `ReportTable.tsx` — tabla genérica con header, filas y totales.
  - `ReportFooter.tsx` — numeración de páginas y aviso "Generado por AtlasERP".
- Crear componentes PDF específicos por reporte:
  - `MovementsReportPdf.tsx` — layout de página carta.
  - `BalancesReportPdf.tsx` — con cards de resumen en la primera sección.
  - `ReceivablesReportPdf.tsx` — con tabla de aging y detalle.
  - `PayablesReportPdf.tsx` — idéntico a receivables.
  - `TransfersReportPdf.tsx` — tabla de transferencias.
- Integrar botón "Exportar PDF" en cada `ReportPage`.
- El PDF se descarga directamente (no se abre en una nueva pestaña) para consistencia con CSV y XLSX.

## Fuera de alcance
- PDF con firma digital (Fase 17+).
- PDF con logo personalizado de la organización (Fase 17+).
- Envío de PDF por email (Fase 17+).

## Dependencias
- `T-1601` a `T-1606`: reportes a los que se integra.
- `T-1607` / `T-1608`: patrón de exportación establecido.

## Criterios de aceptación
- [ ] Componentes PDF base creados y reutilizables.
- [ ] PDF de movimientos con encabezado, tabla y totales correctos.
- [ ] PDF de balances con sección de resumen global.
- [ ] PDF de CxC y CxP con tabla de aging.
- [ ] Todos los PDFs con paginación y footer.
- [ ] `pnpm --filter @atlasrep/web run typecheck`: sin errores.

## Validaciones
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Prueba manual: exportar PDF de movimientos → abrir → encabezado con org + periodo → tabla legible → paginación correcta.

## Pruebas
- PDF de 200 movimientos → varias páginas → header repetido en cada página.
- Encabezado incluye: nombre org, periodo "Enero 2026", fecha generación "14/04/2026", usuario "Tesorero Demo".
- Footer: "Página 1 de 3 | Generado por AtlasERP".
- PDF de balances: cards de resumen en página 1, tabla de cortes en páginas siguientes.

## Riesgos
- **Peso del bundle con @react-pdf/renderer**: librería grande (~1.2MB). Mitigación: import dinámico igual que exceljs — solo se carga al hacer clic en "Exportar PDF".
- **Fuentes y caracteres especiales**: `@react-pdf/renderer` puede tener problemas con caracteres acentuados si no se carga una fuente que los soporte. Mitigación: usar la fuente Helvetica incluida en PDF spec (soporta Latin-1 básico) o cargar Inter/Roboto como fuente embebida.

## Documentación a actualizar
- `apps/web/src/modules/finops/utils/pdf/ReportHeader.tsx` — archivo nuevo.
- `apps/web/src/modules/finops/utils/pdf/ReportTable.tsx` — archivo nuevo.
- `apps/web/src/modules/finops/utils/pdf/ReportFooter.tsx` — archivo nuevo.
- `apps/web/src/modules/finops/utils/pdf/MovementsReportPdf.tsx` — archivo nuevo.
- `apps/web/src/modules/finops/utils/pdf/BalancesReportPdf.tsx` — archivo nuevo.
- `apps/web/src/modules/finops/utils/pdf/ReceivablesReportPdf.tsx` — archivo nuevo.
- `apps/web/src/modules/finops/utils/pdf/PayablesReportPdf.tsx` — archivo nuevo.
- `apps/web/src/modules/finops/utils/pdf/TransfersReportPdf.tsx` — archivo nuevo.

## Decisiones clave
- **`@react-pdf/renderer` sobre jsPDF**: `@react-pdf/renderer` permite definir el layout del PDF con componentes React, lo que reutiliza el conocimiento del equipo. jsPDF requiere un API de canvas más imperativo que es difícil de mantener. La desventaja es el mayor tamaño de bundle, mitigada con import dinámico.

## Evidencia documental
- `apps/web/src/modules/finops/utils/pdf/` (8 archivos)

## Pendientes para la siguiente task
- `T-1610` (Bloque 3) implementa la impresión de reportes desde la app desktop.

## Pendientes no resueltos
- Ninguno.
