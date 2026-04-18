# T-1603 - Crear reporte de saldos por cuenta

## Metadatos
- ID: `T-1603`
- Fase: `Fase 16`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Implementar el reporte de saldos bancarios que consolida el balance por cuenta y por moneda, combinando el resumen global de la organización con el historial de cortes de saldo (balance snapshots).

## Alcance
- Crear página `BalancesReportPage` en `/finops/reports/balances`:
  - Sección "Resumen global" (fuente: `GET /bank-accounts/organization/:id/balance-summary`):
    - Cards por moneda con total consolidado.
    - Total de cuentas activas vs inactivas.
  - Sección "Saldos por cuenta":
    - Tabla con: cuenta, banco, moneda, balance actual, última actualización.
    - Fuente: `GET /api/v1/bank-accounts` (filtro `isActive: true`).
  - Sección "Historial de cortes" (fuente: `GET /api/v1/balance-snapshots`):
    - Filtro por cuenta y rango de fechas.
    - Tabla: fecha de corte, cuenta, moneda, monto, origen (MANUAL/AUTO).
  - Exportación: CSV y XLSX del historial de cortes. PDF del resumen completo.

## Fuera de alcance
- Gráfico de evolución histórica de saldos (Fase 17+).
- Proyección de saldos futuros (Fase 17+).

## Dependencias
- `T-1327`: endpoint balance-summary disponible.
- `T-1304`: endpoint balance-snapshots disponible.
- `T-1417`: `BalancePage` web como referencia de UI.
- `T-1612`: `ReportFilterPanel` disponible.

## Criterios de aceptación
- [ ] Resumen global con cards por moneda correcto.
- [ ] Tabla de saldos por cuenta con datos actualizados.
- [ ] Historial de cortes filtrable y exportable.
- [ ] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: resumen con datos demo → totales correctos → exportar PDF → documento con resumen y tabla.

## Pruebas
- Resumen con 3 cuentas (2 MXN + 1 USD) → 2 cards: MXN y USD con totales correctos.
- Filtrar historial por cuenta "Principal" → solo cortes de esa cuenta.
- Exportar PDF → incluye resumen global + tabla de cortes.

## Riesgos
- **Balance vs snapshot desincronizados**: el balance actual de la cuenta (campo `balance` en DB) puede diferir del último snapshot si hubo movimientos entre el corte y hoy. Mostrar ambos claramente etiquetados.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/reports/BalancesReportPage.jsx` — archivo nuevo.

## Decisiones clave
- **Un reporte, dos perspectivas**: el reporte de saldos combina el estado actual (balance por cuenta) con el historial de cortes (snapshots). El usuario puede ver ambas perspectivas en una sola página en lugar de navegar entre dos.

## Evidencia documental
- `apps/web/src/modules/finops/pages/reports/BalancesReportPage.jsx`

## Pendientes para la siguiente task
- `T-1604` implementa el reporte de transferencias por periodo.

## Pendientes no resueltos
- Ninguno.
