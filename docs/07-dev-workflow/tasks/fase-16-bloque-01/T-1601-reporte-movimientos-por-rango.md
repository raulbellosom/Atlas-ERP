# T-1601 - Crear reporte de movimientos por rango

## Metadatos
- ID: `T-1601`
- Fase: `Fase 16`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Implementar el reporte de movimientos financieros filtrado por rango de fechas, con agrupación por tipo, totales por moneda y exportación a CSV, XLSX y PDF.

## Alcance
- Crear página `MovementsReportPage` en `/finops/reports/movements`:
  - Panel de filtros: rango de fechas (obligatorio), cuenta bancaria (opcional), tipo de movimiento (multi-select), estatus (multi-select), moneda.
  - Tabla de resultados: fecha, cuenta, tipo (con badge de color), descripción, monto, moneda, estatus, referencia.
  - Sección de totales: suma por tipo (INCOME, EXPENSE, TRANSFER_IN, TRANSFER_OUT) y por moneda.
  - Botones de exportación: CSV, XLSX, PDF.
  - Límite de filas: advertencia si > 5,000 registros ("Refina el filtro para mejor rendimiento").
- Fuente de datos: `GET /api/v1/financial-movements/by-filters` con los filtros del panel.
- Usar `ReportFilterPanel` (T-1612) para los filtros.

## Fuera de alcance
- Gráficas de movimientos (Fase 17+).
- Reporte agrupado por cuenta (T-1602).
- Exportación automática programada (Fase 17+).

## Dependencias
- `T-1326`: endpoint `GET /financial-movements/by-filters` disponible.
- `T-1600`: catálogo de reportes definido.
- `T-1612`: `ReportFilterPanel` (se puede desarrollar en paralelo o antes).
- `T-1607` a `T-1609`: funciones de exportación (integrar al final).

## Criterios de aceptación
- [ ] `MovementsReportPage` renderiza datos filtrados correctamente.
- [ ] Totales por tipo y moneda correctos.
- [ ] Exportación a CSV, XLSX y PDF funcional.
- [ ] Advertencia de límite de filas visible al superar 5,000 resultados.
- [ ] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: filtrar por mes → tabla con datos demo → totales correctos → exportar CSV → abrir en Excel y verificar datos.

## Pruebas
- Filtrar enero 2026 → tabla con todos los movimientos del mes → totales correctos por tipo.
- Filtrar tipo INCOME en cuenta "Cuenta Principal" → solo ingresos de esa cuenta.
- Exportar CSV → archivo descargado con headers en español y datos correctos.
- 0 resultados → `EmptyState` con mensaje "Sin movimientos en el periodo seleccionado".

## Riesgos
- **Rendimiento con rangos amplios**: un rango de 1 año con muchos movimientos puede generar una respuesta lenta del API. Mitigación: advertencia de límite de filas + paginación del API si es necesario.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/reports/MovementsReportPage.jsx` — archivo nuevo.

## Decisiones clave
- **Totales siempre visibles**: la sección de totales aparece aunque haya 0 registros (muestra ceros). Esto ayuda al usuario a confirmar que el filtro está activo y simplemente no hay datos, no que hubo un error.
- **Exportación desde los datos cargados, no re-request**: el export usa los datos ya en memoria (react-query cache), no hace una nueva llamada al API. Esto garantiza que el export es idéntico a lo que el usuario ve en pantalla.

## Evidencia documental
- `apps/web/src/modules/finops/pages/reports/MovementsReportPage.jsx`

## Pendientes para la siguiente task
- `T-1602` implementa el reporte de movimientos agrupado por cuenta bancaria.

## Pendientes no resueltos
- Ninguno.
