# T-1505 - Crear caché local de saldos/resúmenes necesarios

## Metadatos
- ID: `T-1505`
- Fase: `Fase 15`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Implementar el caché local del balance summary por organización y el balance individual por cuenta bancaria, permitiendo al usuario consultar los saldos consolidados en modo offline con el estado conocido al momento del último sync.

## Alcance
- Crear hook `useBalanceSummaryDesktop()`:
  - Online: llama a `GET /api/v1/bank-accounts/organization/:orgId/balance-summary`, guarda en `finops_balance_summary_cache`.
  - Offline: lee desde `finopsCache.getBalanceSummary(organizationId)`.
  - Muestra timestamp "Saldo al [fecha de último sync]" cuando está en modo offline.
- Crear hook `useAccountBalanceDesktop(bankAccountId)`:
  - Online: llama a `GET /api/v1/bank-accounts/:id/balance`, guarda balance en columna `balance` de `finops_bank_accounts_cache`.
  - Offline: lee desde el caché de cuentas bancarias.
- Integrar en `BalancePage` desktop.
- Mostrar indicador de advertencia cuando el saldo mostrado está desactualizado (offline > 24h).

## Fuera de alcance
- Recálculo de saldos en base a movimientos offline (el saldo del caché es el último conocido del servidor — no se actualiza con movimientos pendientes de sync).
- Gráfico histórico de saldos (Fase 16+).

## Dependencias
- `T-1502`: tabla `finops_balance_summary_cache` disponible.
- `T-1503`: patrón de hook desktop y caché de cuentas bancarias establecido.
- `T-1417`: `BalancePage` web como base de la versión desktop.

## Criterios de aceptación
- [x] Hook `useBalanceSummaryDesktop` implementado en `apps/desktop/src/modules/finops/hooks/useBalanceSummaryDesktop.js`.
- [x] Hook `useAccountBalanceDesktop` implementado en `apps/desktop/src/modules/finops/hooks/useAccountBalanceDesktop.js`.
- [x] `BalancePage` desktop creada en `apps/desktop/src/pages/finops/BalancePage.jsx` con banner offline y advertencia de > 24h.
- [x] `pnpm --filter @atlasrep/desktop run lint`: 0 errores.

## Validaciones
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.
- Revisión manual: offline → `BalancePage` muestra saldos con "Saldo al [fecha]" y advertencia si pasaron más de 24h.

## Pruebas
- Online → sincronizar → desconectar → `BalancePage` muestra saldos con timestamp.
- Offline por más de 24h → advertencia "Saldo puede estar desactualizado" visible.
- Caché vacía + offline → `EmptyState` con "Sin datos locales. Conecta para ver los saldos."

## Riesgos
- **Saldo offline no refleja movimientos pendientes de sync**: si el usuario creó 3 movimientos offline, el saldo del caché no los incluye. Esto puede confundir al usuario. Mitigación: mostrar claramente "Saldo al [fecha de sync]" y advertir que puede no incluir movimientos recientes.

## Documentación a actualizar
- `apps/desktop/src/modules/finops/hooks/useBalanceSummaryDesktop.ts` — archivo nuevo.
- `apps/desktop/src/modules/finops/hooks/useAccountBalanceDesktop.ts` — archivo nuevo.
- `apps/desktop/src/pages/finops/BalancePage.tsx` — adaptación desktop.

## Decisiones clave
- **No recalcular saldos con movimientos offline**: recalcular el saldo local sumando los movimientos pendientes de sync introduciría inconsistencias (el backend puede haber registrado otros movimientos que el desktop desconoce). Es más seguro mostrar el último saldo conocido del servidor con una advertencia clara.

## Evidencia documental
- `apps/desktop/src/modules/finops/hooks/useBalanceSummaryDesktop.ts`
- `apps/desktop/src/modules/finops/hooks/useAccountBalanceDesktop.ts`
- `apps/desktop/src/pages/finops/BalancePage.tsx`

## Pendientes para la siguiente task
- `T-1506` implementa los formularios desktop con persistencia local para operaciones de creación.

## Pendientes no resueltos
- Ninguno.
