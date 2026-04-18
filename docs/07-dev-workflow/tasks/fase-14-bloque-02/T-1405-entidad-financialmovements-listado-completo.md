# T-1405 - Entidad FinancialMovements: listado completo

## Metadatos
- ID: `T-1405`
- Fase: `Fase 14`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar la página de listado completo de movimientos financieros, mostrando todos los ingresos, egresos y transferencias de la organización con indicadores visuales de tipo, estatus y monto.

## Alcance
- Crear página `FinancialMovementsPage` en `/finops/movements`.
- Tabla de movimientos con columnas: fecha, tipo (badge), descripción, cuenta, monto (color por tipo), moneda, estatus, conciliado.
- Filtros básicos visibles: rango de fechas, cuenta bancaria.
- Botón "Registrar movimiento" que navega a creación.
- Integración con `GET /api/v1/financial-movements` vía react-query.
- Estados de carga (skeleton) y vacío ("Sin movimientos registrados").

## Fuera de alcance
- Panel de filtros avanzados (eso es T-1406).
- Creación de movimiento (eso es T-1407).
- Anulación/edición (eso es T-1408).
- Vista de detalle (eso es T-1409).

## Dependencias
- `T-1400`: layout FinOps disponible.
- `T-1301`: endpoint `GET /api/v1/financial-movements` disponible.

## Criterios de aceptación
- [x] Listado de movimientos implementado con badges de tipo y estatus.
- [x] Montos con indicación visual de ingreso (verde) vs. egreso (rojo).
- [x] Filtros de fecha y cuenta básicos funcionales.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: movimientos demo cargan con tipos y montos correctos.

## Pruebas
- Lista muestra movimientos del seed con tipo INCOME en verde y EXPENSE en rojo.
- Filtrar por rango de fecha — lista se actualiza.
- Estado "ANULADO" muestra badge diferenciado.
- Sin movimientos — mensaje de estado vacío.

## Riesgos
- **Enums de tipo no mapeados**: `FinancialMovementType` tiene valores como `TRANSFER_OUT`, `TRANSFER_IN` que deben tener labels legibles. Mitigación: diccionario `MOVEMENT_TYPE_LABELS` en el módulo.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/FinancialMovementsPage.jsx` — archivo nuevo.
- `apps/web/src/modules/finops/hooks/useFinancialMovements.js`.

## Decisiones clave
- **Enums mapeados a diccionarios del frontend**: consistente con la decisión técnica de T-1401.
- **Color por tipo de movimiento**: verde para ingresos, rojo para egresos, gris para transferencias — convención financiera estándar.

## Evidencia documental
- `apps/web/src/modules/finops/pages/FinancialMovementsPage.jsx`
- `apps/web/src/modules/finops/hooks/useFinancialMovements.js`

## Pendientes para la siguiente task
- `T-1406` agrega el panel de filtros avanzados a la página de movimientos.

## Pendientes no resueltos
- Ninguno.
