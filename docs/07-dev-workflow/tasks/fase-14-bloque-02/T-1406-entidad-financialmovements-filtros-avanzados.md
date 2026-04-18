# T-1406 - Entidad FinancialMovements: filtros avanzados

## Metadatos
- ID: `T-1406`
- Fase: `Fase 14`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar el panel de filtros avanzados para la página de movimientos financieros, permitiendo búsqueda granular por múltiples criterios simultáneos.

## Alcance
- Panel de filtros colapsable/expandible en `FinancialMovementsPage`.
- Filtros implementados:
  - Rango de fechas (date picker).
  - Tipo de movimiento (Select múltiple Radix).
  - Estatus (Select Radix).
  - Cuenta bancaria (Select con búsqueda).
  - Conciliado / No conciliado (toggle).
  - Sucursal (Select).
- Botón "Aplicar filtros" y "Limpiar filtros".
- Integración con `GET /api/v1/financial-movements/by-filters` usando `ListFinancialMovementsQueryDto`.
- URL params sincronizados con los filtros activos (para compartir/bookmark).

## Fuera de alcance
- Filtros guardados/favoritos (Fase 15+).
- Filtros por etiqueta de gasto (Fase 15+).

## Dependencias
- `T-1405`: listado de movimientos base implementado.
- `T-1326`: endpoint `/by-filters` disponible en backend.

## Criterios de aceptación
- [x] Panel de filtros implementado con todos los campos.
- [x] Selects de Radix UI para filtros de enum.
- [x] Filtros aplicados correctamente a la query.
- [x] URL params sincronizados.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: filtros reducen resultados correctamente.

## Pruebas
- Seleccionar tipo "INCOME" — lista muestra solo ingresos.
- Seleccionar rango de fechas — lista muestra solo movimientos del periodo.
- Limpiar filtros — lista vuelve a mostrar todos los movimientos.
- Compartir URL con filtros — al cargar la URL, los filtros están pre-aplicados.

## Riesgos
- **Serialización de filtros en URL**: algunos filtros (como rango de fechas) requieren serialización especial en query params. Mitigación: usar formato ISO para fechas en URL (`from=2026-01-01&to=2026-04-30`).

## Documentación a actualizar
- `apps/web/src/modules/finops/components/MovementsFilterPanel.jsx` — componente nuevo.

## Decisiones clave
- **URL params sincronizados con filtros**: el estado de los filtros se refleja en la URL para permitir bookmarking y compartir vistas filtradas. Se usa `useSearchParams` de React Router para la sincronización.
- **Select múltiple para tipo de movimiento**: el usuario puede filtrar por más de un tipo simultáneamente (ej. INCOME + TRANSFER_IN).

## Evidencia documental
- `apps/web/src/modules/finops/components/MovementsFilterPanel.jsx`

## Pendientes para la siguiente task
- `T-1407` implementa el formulario de creación de movimientos.

## Pendientes no resueltos
- Ninguno.
