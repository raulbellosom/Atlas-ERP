# T-1607 - Crear exportación CSV de movimientos

## Metadatos
- ID: `T-1607`
- Fase: `Fase 16`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Implementar la función de exportación a CSV para los reportes del módulo FinOps, comenzando con movimientos y creando una utilidad reutilizable para todos los reportes de la fase.

## Alcance
- Crear utilidad `exportToCsv(rows, columns, filename)` en `apps/web/src/modules/finops/utils/exportCsv.ts`:
  - `rows`: array de objetos de datos.
  - `columns`: array de `{ key: string, header: string, format?: (val) => string }`.
  - `filename`: nombre del archivo sin extensión.
  - Genera un `Blob` CSV con BOM UTF-8 (para compatibilidad con Excel en Windows).
  - Usa `URL.createObjectURL` + `<a download>` para descargar.
  - Separador: coma. Valores con comas envueltos en comillas dobles.
- Integrar `exportToCsv` en:
  - `MovementsReportPage` (T-1601) — botón "Exportar CSV".
  - `MovementsByAccountReportPage` (T-1602) — un archivo CSV por cuenta seleccionada.
  - `TransfersReportPage` (T-1604) — botón "Exportar CSV".
  - `ReceivablesReportPage` (T-1605) — botón "Exportar CSV".
  - `PayablesReportPage` (T-1606) — botón "Exportar CSV".
- Columnas del CSV de movimientos: Fecha, Cuenta, Tipo, Descripción, Monto, Moneda, Estatus, Referencia.
- Formato de fecha: `DD/MM/YYYY` (formato latinoamericano).
- Formato de monto: número con 2 decimales, sin símbolo de moneda (la moneda va en columna separada).

## Fuera de alcance
- Exportación de XLSX (T-1608).
- Exportación de PDF (T-1609).
- Exportación masiva por lotes de múltiples reportes simultáneos (Fase 17+).

## Dependencias
- `T-1601` a `T-1606`: reportes que consumirán la exportación.

## Criterios de aceptación
- [ ] Utilidad `exportToCsv` creada y tipada correctamente.
- [ ] BOM UTF-8 presente para compatibilidad con Excel en Windows.
- [ ] Integrada en los 5 reportes de la fase.
- [ ] `pnpm --filter @atlasrep/web run typecheck`: sin errores.

## Validaciones
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Prueba manual: exportar movimientos → abrir CSV en Excel → caracteres acentuados correctos (sin mojibake) → números como números (no texto).

## Pruebas
- CSV de movimientos: 10 filas → archivo con 11 líneas (1 header + 10 datos) → valores correctos.
- Descripción con coma ("Pago, mes de enero") → valor envuelto en comillas en el CSV.
- Abrir en Excel Windows → sin caracteres extraños (BOM UTF-8 correcto).
- Monto "1234.56" → aparece como número en Excel, no como texto.

## Riesgos
- **Separador decimal para Excel en español**: Excel en configuración regional latinoamericana espera coma como separador decimal. Si el CSV usa punto decimal, Excel puede malinterpretar los números. Decisión: usar punto decimal (estándar CSV internacional) y documentar que el usuario debe ajustar la configuración de importación si necesario.

## Documentación a actualizar
- `apps/web/src/modules/finops/utils/exportCsv.ts` — archivo nuevo.

## Decisiones clave
- **BOM UTF-8 obligatorio**: sin BOM, Excel en Windows abre el CSV con caracteres latinos incorrectos. El BOM (`\uFEFF`) al inicio del archivo fuerza a Excel a interpretar el archivo como UTF-8.
- **Utilidad genérica desde el primer reporte**: en lugar de hardcodear la lógica de CSV en cada reporte, se crea la utilidad genérica desde T-1607 para reutilizarla en todos los demás. Evita duplicación y garantiza consistencia.

## Evidencia documental
- `apps/web/src/modules/finops/utils/exportCsv.ts`

## Pendientes para la siguiente task
- `T-1608` implementa la exportación XLSX con formato enriquecido.

## Pendientes no resueltos
- Ninguno.
