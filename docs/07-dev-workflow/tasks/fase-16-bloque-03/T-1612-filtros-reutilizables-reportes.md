# T-1612 - Crear filtros reutilizables de reportes

## Metadatos
- ID: `T-1612`
- Fase: `Fase 16`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Crear el componente `ReportFilterPanel` reutilizable que centraliza la lógica de filtros para todos los reportes del módulo FinOps, garantizando consistencia visual y de comportamiento entre reportes.

## Alcance
- Crear `ReportFilterPanel` en `apps/web/src/modules/finops/components/reports/ReportFilterPanel.jsx`:
  - Props configurables: `filters` (array de FilterConfig), `value`, `onChange`.
  - `FilterConfig` soporta los tipos:
    - `dateRange`: date range picker con shortcuts (Este mes, Mes anterior, Trimestre actual, Año actual, Personalizado).
    - `select`: select simple con opciones.
    - `multiSelect`: select múltiple con opciones (usando Radix UI).
    - `text`: input de texto para búsqueda libre.
  - Comportamiento: filtros activos mostrados como badges removibles. Botón "Limpiar todo".
  - Persistencia: estado de filtros en URL params (`useSearchParams`) para que el usuario pueda compartir el link del reporte con los filtros activos.
- Shortcuts de fecha:
  - "Este mes": `[startOfMonth(today), endOfMonth(today)]`.
  - "Mes anterior": `[startOfMonth(subMonths(today,1)), endOfMonth(subMonths(today,1))]`.
  - "Trimestre actual": `[startOfQuarter(today), endOfQuarter(today)]`.
  - "Año actual": `[startOfYear(today), endOfYear(today)]`.
  - Usar `date-fns` para los cálculos (ya instalado en el workspace).
- Integrar `ReportFilterPanel` en todas las páginas de reporte (T-1601 a T-1606).

## Fuera de alcance
- Guardado de filtros favoritos (Fase 17+).
- Filtros condicionales (mostrar filtro B solo si filtro A tiene cierto valor — Fase 17+).

## Dependencias
- `T-1601` a `T-1606`: reportes que consumen el panel (puede desarrollarse en paralelo).
- `T-1406`: `MovementsFilterPanel` web como referencia del patrón de filtros del módulo.
- `date-fns` instalado en el workspace.

## Criterios de aceptación
- [ ] `ReportFilterPanel` implementado con los 4 tipos de filtro.
- [ ] Shortcuts de fecha funcionales.
- [ ] Badges de filtros activos con opción de remover.
- [ ] Estado de filtros persistido en URL params.
- [ ] Integrado en todas las páginas de reporte.
- [ ] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Prueba manual: aplicar filtro "Este mes" → URL params actualizados → compartir URL → mismos filtros activos al abrir.

## Pruebas
- Shortcut "Mes anterior" → rango de fechas correcto para el mes anterior.
- Badge activo "Tipo: INCOME" → click en × → filtro removido → datos se actualizan.
- "Limpiar todo" → todos los filtros reseteados.
- URL con `?from=2026-01-01&to=2026-01-31&type=INCOME` → filtros pre-aplicados al cargar.

## Riesgos
- **Sincronización URL params ↔ estado local**: si el usuario modifica los params de URL directamente, el panel debe sincronizarse. Mitigación: `useSearchParams` en modo controlado — el panel es la única fuente de verdad para los params.

## Documentación a actualizar
- `apps/web/src/modules/finops/components/reports/ReportFilterPanel.jsx` — archivo nuevo.

## Decisiones clave
- **Shortcuts de fecha como UX principal**: la mayoría de los reportes financieros se consultan por periodos estándar (mes, trimestre, año). Los shortcuts reducen drásticamente el tiempo de configuración del filtro — el caso de uso típico es 1 clic, no selección manual de fechas.
- **Persistencia en URL, no en localStorage**: la URL es compartible y se resetea naturalmente al cerrar la pestaña. localStorage persiste más de lo necesario para un panel de filtros de reporte.

## Evidencia documental
- `apps/web/src/modules/finops/components/reports/ReportFilterPanel.jsx`

## Pendientes para la siguiente task
- `T-1613` implementa la auditoría de exportaciones.

## Pendientes no resueltos
- Ninguno.
