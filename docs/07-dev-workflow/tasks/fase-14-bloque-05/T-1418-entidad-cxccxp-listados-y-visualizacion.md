# T-1418 - Entidad CxC/CxP: listados y visualización (Receivables/Payables)

## Metadatos
- ID: `T-1418`
- Fase: `Fase 14`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar las páginas de listado de cuentas por cobrar (ReceivablesLite) y cuentas por pagar (PayablesLite), con CRUD completo y visualización del KPI de vencidas por organización.

## Alcance
- Crear página `ReceivablesPage` en `/finops/receivables`.
- Crear página `PayablesPage` en `/finops/payables`.
- Tabla de CxC/CxP: contraparte, monto, moneda, vencimiento, estatus (badge), días de mora.
- KPI "Vencidas": counter de CxC/CxP vencidas en el encabezado de página.
- Filtros: estatus, vencimiento (vencidas/próximas/futuras), contraparte.
- CRUD: crear, editar, eliminar (soft-delete) CxC y CxP.
- Integración con:
  - `GET /api/v1/receivables-lite` y `GET /api/v1/payables-lite`.
  - KPI: `GET /api/v1/receivables-lite/organization/:id/overdue-count`.
  - `POST`, `PATCH`, `DELETE` para ambas entidades.

## Fuera de alcance
- Integración con módulo de facturación real (Fase 15+).
- Flujo de cobro/pago automático (Fase 15+).

## Dependencias
- `T-1305`, `T-1306`: endpoints GET disponibles.
- `T-1318`, `T-1319`, `T-1323`, `T-1324`: endpoints de escritura disponibles.

## Criterios de aceptación
- [x] Listados de CxC y CxP implementados con KPI de vencidas.
- [x] CRUD de CxC y CxP funcional.
- [x] Visualización de días de mora.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: listados de CxC y CxP demo con KPI correcto.

## Pruebas
- Listado de CxC muestra vencidas en rojo con días de mora.
- KPI de vencidas muestra número correcto.
- Crear CxC — aparece en lista con estatus PENDING.
- Filtrar por "Solo vencidas" — solo muestra CxC con vencimiento pasado.

## Riesgos
- **Cálculo de días de mora en frontend**: los días de mora se calculan como `(today - dueDate).days`. Si `dueDate` llega como string ISO, debe convertirse a Date.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/ReceivablesPage.jsx` — archivo nuevo.
- `apps/web/src/modules/finops/pages/PayablesPage.jsx` — archivo nuevo.

## Decisiones clave
- **KPI de vencidas en encabezado**: el número de CxC/CxP vencidas es un indicador de riesgo financiero. Se muestra prominentemente en el encabezado de la página, no enterrado en filtros.
- **Días de mora calculados en frontend**: el cálculo de `(today - dueDate)` se hace en el frontend para evitar una llamada adicional al API. El backend proporciona la fecha de vencimiento.

## Evidencia documental
- `apps/web/src/modules/finops/pages/ReceivablesPage.jsx`
- `apps/web/src/modules/finops/pages/PayablesPage.jsx`

## Pendientes para la siguiente task
- `T-1419` implementa los estados de interfaz (carga, vacío, error) de forma consistente.

## Pendientes no resueltos
- Ninguno.
