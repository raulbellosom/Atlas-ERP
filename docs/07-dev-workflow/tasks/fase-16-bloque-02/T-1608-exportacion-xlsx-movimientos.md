# T-1608 - Crear exportación XLSX de movimientos

## Metadatos
- ID: `T-1608`
- Fase: `Fase 16`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Implementar la exportación a formato XLSX (Excel) para los reportes del módulo FinOps, con estilos básicos, múltiples hojas donde aplique y formato numérico correcto para montos.

## Alcance
- Instalar `exceljs` en `apps/web/` (`pnpm add exceljs --filter @atlasrep/web`).
- Crear utilidad `exportToXlsx(sheets, filename)` en `apps/web/src/modules/finops/utils/exportXlsx.ts`:
  - `sheets`: array de `{ name: string, columns: Column[], rows: Row[] }`.
  - Estilos: header con fondo azul oscuro y texto blanco en negrita, filas alternas con fondo gris claro.
  - Columnas de monto: tipo `number`, formato `#,##0.00`.
  - Columnas de fecha: tipo `date`, formato `DD/MM/YYYY`.
  - Congelar primera fila (freeze panes).
  - Auto-fit de ancho de columna (basado en el contenido más largo).
- Integrar en todos los reportes con botón "Exportar XLSX":
  - `MovementsReportPage`: 1 hoja de movimientos + 1 hoja de totales.
  - `MovementsByAccountReportPage`: 1 hoja por cuenta + 1 hoja de resumen global.
  - `TransfersReportPage`: 1 hoja.
  - `ReceivablesReportPage`: 1 hoja de aging + 1 hoja de detalle.
  - `PayablesReportPage`: 1 hoja de aging + 1 hoja de detalle.

## Fuera de alcance
- Gráficas embebidas en XLSX (Fase 17+).
- Plantillas de Excel personalizadas (Fase 17+).
- Exportación XLSX desde desktop (usa la misma utilidad web en el WebView de Tauri).

## Dependencias
- `T-1607`: patrón de exportación CSV establecido — XLSX sigue el mismo patrón de utilidad genérica.
- `T-1601` a `T-1606`: reportes a los que se integra.

## Criterios de aceptación
- [ ] `exportToXlsx` creada y funcional.
- [ ] Estilos básicos aplicados (header, filas alternas, freeze panes).
- [ ] Montos como tipo número en Excel (no texto).
- [ ] Integrada en los 5 reportes.
- [ ] `pnpm --filter @atlasrep/web run typecheck`: sin errores.

## Validaciones
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Prueba manual: exportar → abrir en Excel → header visible, filas con alternancia → montos con formato numérico → filtro automático de Excel funcional en header.

## Pruebas
- Exportar movimientos → archivo .xlsx descargado → abrir → 2 hojas (Movimientos + Totales).
- Celda de monto: tipo número, no texto → se puede sumar con fórmula de Excel.
- MovementsByAccount con 3 cuentas → 4 hojas (3 cuentas + 1 resumen).
- Archivo < 2MB para 1,000 registros.

## Riesgos
- **Tamaño de bundle con exceljs**: `exceljs` es una librería pesada (~500KB minificada). Mitigación: import dinámico (`import('exceljs')`) para que solo se cargue cuando el usuario hace clic en "Exportar XLSX".

## Documentación a actualizar
- `apps/web/src/modules/finops/utils/exportXlsx.ts` — archivo nuevo.

## Decisiones clave
- **Import dinámico de exceljs**: para no impactar el bundle inicial de la app, `exceljs` se carga de forma lazy solo cuando se necesita. Esto es transparente para el usuario (puede haber un breve delay de 200-300ms la primera vez).
- **Auto-fit de columnas**: calcular el ancho óptimo de cada columna basado en el contenido más largo hace que el XLSX sea legible de inmediato sin que el usuario tenga que ajustar manualmente los anchos.

## Evidencia documental
- `apps/web/src/modules/finops/utils/exportXlsx.ts`

## Pendientes para la siguiente task
- `T-1609` implementa la exportación PDF de los listados clave.

## Pendientes no resueltos
- Ninguno.
