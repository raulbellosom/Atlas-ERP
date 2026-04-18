# T-1415 - Entidad Reconciliation: sesiones (listado y creación)

## Metadatos
- ID: `T-1415`
- Fase: `Fase 14`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar el listado de sesiones de conciliación bancaria y el formulario de creación de nuevas sesiones, permitiendo al tesorero iniciar el proceso de cierre contable por periodo.

## Alcance
- Crear página `ReconciliationPage` en `/finops/reconciliation`.
- Listado de sesiones con: nombre, cuenta bancaria, periodo (inicio/fin), estatus (badge), fecha de creación.
- Filtros: por cuenta, estatus (OPEN, CLOSED, APPROVED), rango de periodo.
- Botón "Nueva sesión" con formulario de creación:
  - Nombre de sesión, cuenta bancaria (Select), periodo inicio/fin (date range picker).
- Integración con:
  - `GET /api/v1/reconciliation/sessions` vía react-query.
  - `POST /api/v1/reconciliation/sessions` vía useMutation.

## Fuera de alcance
- Wizard interactivo de conciliación (eso es T-1416).
- Cierre y aprobación de sesión desde lista (se hace desde el wizard T-1416).

## Dependencias
- `T-1400`: layout FinOps disponible.
- `T-1303`: endpoint `GET /api/v1/reconciliation/sessions` disponible.
- `T-1316`: endpoint `POST /api/v1/reconciliation/sessions` disponible.

## Criterios de aceptación
- [x] Listado de sesiones de conciliación implementado.
- [x] Formulario de creación de sesión funcional.
- [x] Integración con API via react-query.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: creación de sesión demo exitosa.

## Pruebas
- Listado muestra sesiones del seed con estatus diferenciados.
- Crear nueva sesión con periodo y cuenta — aparece en lista como OPEN.
- Filtrar por estatus CLOSED — solo sesiones cerradas.

## Riesgos
- **Date range picker**: el selector de rango de fechas para el periodo requiere un componente específico. Si el design system no tiene uno, se deben usar dos `<input type="date">`.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/ReconciliationPage.jsx` — archivo nuevo.
- `apps/web/src/modules/finops/hooks/useReconciliationSessions.js`.

## Decisiones clave
- **Sesión de conciliación como punto de entrada**: el listado de sesiones es el hub del módulo de conciliación. Desde aquí el usuario accede al wizard interactivo de conciliación por sesión.

## Evidencia documental
- `apps/web/src/modules/finops/pages/ReconciliationPage.jsx`
- `apps/web/src/modules/finops/hooks/useReconciliationSessions.js`

## Pendientes para la siguiente task
- `T-1416` implementa el wizard interactivo de conciliación.

## Pendientes no resueltos
- Ninguno.
