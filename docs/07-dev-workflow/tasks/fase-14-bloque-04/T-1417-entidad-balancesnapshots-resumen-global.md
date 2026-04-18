# T-1417 - Entidad BalanceSnapshots: resumen global

## Metadatos
- ID: `T-1417`
- Fase: `Fase 14`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar la página de resumen global de saldos bancarios por organización, mostrando el balance consolidado por moneda y el historial de cortes de saldo por cuenta.

## Alcance
- Crear página `BalancePage` en `/finops/balance`.
- Sección "Resumen por organización":
  - Total de cuentas activas.
  - Balance consolidado por moneda (cards).
  - Fuente: `GET /api/v1/bank-accounts/organization/:orgId/balance-summary`.
- Sección "Historial de cortes":
  - Lista de snapshots ordenados por fecha (más reciente primero).
  - Filtro por cuenta bancaria.
  - Fuente: `GET /api/v1/balance-snapshots`.
- Botón "Registrar corte manual" (abre formulario de `POST /api/v1/balance-snapshots` — solo para admin).

## Fuera de alcance
- Gráfico de evolución histórica de saldos (Fase 15+).
- Corte automático programado (Fase 15+).

## Dependencias
- `T-1327`: endpoint de resumen de saldos disponible.
- `T-1304`, `T-1317`: endpoints de balance snapshots disponibles.

## Criterios de aceptación
- [x] Resumen de saldos por moneda visible.
- [x] Historial de cortes de saldo funcional.
- [x] Registro manual de corte (para usuarios autorizados).
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: resumen global con datos demo correcto.

## Pruebas
- Resumen muestra totales por moneda correctos.
- Filtrar historial por cuenta — muestra solo snapshots de esa cuenta.
- Registrar corte manual — aparece en historial.

## Riesgos
- **Resumen con múltiples monedas**: si la organización tiene cuentas en MXN, USD y EUR, se deben mostrar 3 cards separados. No se mezclan monedas.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/BalancePage.jsx` — archivo nuevo.
- `apps/web/src/modules/finops/hooks/useBalanceSummary.js`.

## Decisiones clave
- **Resumen por moneda como cards**: el formato de cards (una por moneda) es más claro que una tabla para comparar totales. Facilita la lectura rápida del estado financiero.

## Evidencia documental
- `apps/web/src/modules/finops/pages/BalancePage.jsx`
- `apps/web/src/modules/finops/hooks/useBalanceSummary.js`

## Pendientes para la siguiente task
- `T-1418` (Bloque 5) implementa los listados de CxC y CxP.

## Pendientes no resueltos
- Ninguno.
