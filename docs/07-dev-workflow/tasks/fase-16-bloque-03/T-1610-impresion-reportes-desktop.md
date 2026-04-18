# T-1610 - Crear impresión de reportes desde desktop

## Metadatos
- ID: `T-1610`
- Fase: `Fase 16`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Implementar la funcionalidad de impresión directa de reportes desde la aplicación desktop Tauri, aprovechando el diálogo de impresión nativo del sistema operativo y los estilos CSS de impresión para generar una salida de impresión limpia.

## Alcance
- Crear utilidad `printReport()` en `apps/desktop/src/modules/finops/utils/printReport.ts`:
  - Llama a `window.print()` dentro del WebView de Tauri.
  - Antes de imprimir: aplica clase `print-mode` al contenedor del reporte para activar los estilos de impresión.
  - Después de imprimir: remueve la clase.
- Crear hoja de estilos de impresión `apps/desktop/src/modules/finops/styles/report-print.css`:
  - `@media print`: ocultar sidebar, topbar, botones de acción y filtros.
  - Mostrar solo la tabla del reporte y el encabezado con datos de la organización y periodo.
  - Configurar página: `@page { size: letter landscape; margin: 1cm; }` para tablas anchas.
  - Evitar corte de filas entre páginas: `tr { page-break-inside: avoid; }`.
- Integrar botón "Imprimir" en todas las `ReportPage` del desktop (no en web — web usa PDF).
- Diferenciación web/desktop: en web, el PDF es el equivalente de impresión. En desktop, el botón "Imprimir" usa el diálogo nativo del SO.

## Fuera de alcance
- Impresión de comprobantes individuales (T-1611).
- Integración con spooler de impresión del SO via plugin Tauri nativo (hardening Fase 17+, referenciado en T-0908).
- Selección de impresora específica desde la UI (usa el diálogo nativo del SO).

## Dependencias
- `T-1601` a `T-1606`: páginas de reporte desktop disponibles.
- `T-1609`: PDF desktop usa el mismo componente PDF de web en el WebView de Tauri.
- `T-0908`: bridge de impresión Tauri referenciado como hardening futuro.

## Criterios de aceptación
- [ ] `printReport()` implementada y funcional en Tauri.
- [ ] Estilos de impresión: sidebar y controles ocultos, tabla y encabezado visibles.
- [ ] Botón "Imprimir" integrado en todas las páginas de reporte desktop.
- [ ] `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.

## Validaciones
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.
- Prueba manual: hacer clic en "Imprimir" → diálogo de impresión del SO → vista previa muestra solo la tabla y encabezado → sin sidebar ni botones.

## Pruebas
- Click "Imprimir" en `MovementsReportPage` desktop → diálogo nativo del SO abre.
- Vista previa de impresión: sin sidebar, sin filtros, solo encabezado + tabla.
- Reporte en landscape: tabla ancha cabe en la página sin cortes de columna.
- Fila no cortada entre páginas: configuración `page-break-inside: avoid` activa.

## Riesgos
- **Diálogo de impresión en Windows vs macOS**: `window.print()` abre el diálogo nativo del SO, que varía entre Windows y macOS. El comportamiento esperado es idéntico en ambos, pero el aspecto del diálogo es diferente. No se puede controlar — es nativo.

## Documentación a actualizar
- `apps/desktop/src/modules/finops/utils/printReport.ts` — archivo nuevo.
- `apps/desktop/src/modules/finops/styles/report-print.css` — archivo nuevo.

## Decisiones clave
- **`window.print()` sobre plugin Tauri de impresión**: `window.print()` es suficiente para v1 y no requiere Rust adicional. El plugin Tauri de impresión nativa (T-0908) se reserva para cuando el negocio requiera impresión silenciosa (sin diálogo) o selección programática de impresora.

## Evidencia documental
- `apps/desktop/src/modules/finops/utils/printReport.ts`
- `apps/desktop/src/modules/finops/styles/report-print.css`

## Pendientes para la siguiente task
- `T-1611` implementa la impresión de comprobantes individuales.

## Pendientes no resueltos
- Ninguno.
