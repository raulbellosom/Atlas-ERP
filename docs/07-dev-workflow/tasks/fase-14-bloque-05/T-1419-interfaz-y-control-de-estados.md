# T-1419 - Interfaz y control de estados (Loading/Empty/Error)

## Metadatos
- ID: `T-1419`
- Fase: `Fase 14`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Auditar y estandarizar el manejo de estados de interfaz (Loading, Empty, Error) en todas las páginas del módulo FinOps, garantizando una experiencia de usuario consistente y accesible en todos los casos de estado.

## Alcance
- Crear componentes reutilizables:
  - `LoadingSkeleton` — skeleton animado para tablas y cards del módulo.
  - `EmptyState` — estado vacío con mensaje contextual e icono.
  - `ErrorState` — estado de error con mensaje y botón de retry.
- Integrar los componentes en todas las páginas del módulo:
  - `BankAccountsPage`, `FinancialMovementsPage`, `TransfersPage`, `ReconciliationPage`, `BalancePage`, `ReceivablesPage`, `PayablesPage`.
- Verificar que react-query retorna `isLoading`, `isError`, `data` correctamente en cada hook.

## Fuera de alcance
- Toast de notificaciones globales (ya existentes en el sistema).
- Manejo de errores 401/403 (manejado por el interceptor global del API client).

## Dependencias
- `T-1401` a `T-1418`: todas las páginas del módulo implementadas.

## Criterios de aceptación
- [x] Componentes LoadingSkeleton, EmptyState, ErrorState creados y usados en todas las páginas.
- [x] Consistencia de estados en todo el módulo.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: todos los estados visibles y coherentes en todas las páginas.

## Pruebas
- Deshabilitar red — todas las páginas muestran `ErrorState` con botón de retry.
- Limpiar BD demo — páginas sin datos muestran `EmptyState` con mensaje contextual.
- Habilitar red con latencia alta — `LoadingSkeleton` visible durante la carga.

## Riesgos
- **Estados inconsistentes pre-existentes**: algunas páginas pueden haberse implementado sin los componentes estándar. Esta task los audita y unifica.

## Documentación a actualizar
- `apps/web/src/modules/finops/components/LoadingSkeleton.jsx` — archivo nuevo.
- `apps/web/src/modules/finops/components/EmptyState.jsx` — archivo nuevo.
- `apps/web/src/modules/finops/components/ErrorState.jsx` — archivo nuevo.

## Decisiones clave
- **Componentes de estado a nivel de módulo**: aunque el sistema tiene componentes globales, los del módulo FinOps tienen mensajes contextuales específicos (ej. "Sin cuentas bancarias registradas" en lugar de "Sin datos").

## Evidencia documental
- `apps/web/src/modules/finops/components/LoadingSkeleton.jsx`
- `apps/web/src/modules/finops/components/EmptyState.jsx`
- `apps/web/src/modules/finops/components/ErrorState.jsx`

## Pendientes para la siguiente task
- `T-1420` implementa el banner de estado offline.

## Pendientes no resueltos
- Ninguno.
