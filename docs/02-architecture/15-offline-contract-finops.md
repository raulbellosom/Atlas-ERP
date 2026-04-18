# 15 — Contrato Offline: Módulo FinOps

## Propósito

Este documento define el contrato formal de operaciones disponibles y bloqueadas en modo offline para el módulo **Financial Operations (FinOps)** en la aplicación desktop Tauri. Es la fuente de verdad que deben consultar los agentes y desarrolladores al implementar o modificar el comportamiento offline del módulo.

Origen: `T-1500` y `T-1501` de Fase 15.

---

## Principios de diseño offline

1. **Crear sí, editar no**: las operaciones de creación son seguras de encolar (no producen conflictos). Las ediciones requieren conocer el estado actual del servidor y pueden generar conflictos de merge — bloqueadas en v1.
2. **Leer siempre**: todos los datos en caché son accesibles sin conexión. La frescura se indica con `lastSyncedAt`.
3. **Consistencia sobre disponibilidad**: cuando hay duda sobre si una operación es segura offline, se bloquea. Es mejor pedir conexión que crear inconsistencias financieras.
4. **UX honesta**: el sistema nunca simula estar online. Los datos del caché se presentan explícitamente como "datos al [fecha]", nunca como datos en tiempo real.

---

## Tabla de operaciones permitidas

| Entidad | Leer caché | Crear (encolado) | Editar | Eliminar |
|---------|:---------:|:---------------:|:------:|:--------:|
| BankAccounts | ✅ | ❌ | ❌ | ❌ |
| FinancialMovements | ✅ (90 días) | ✅ | ❌ | ❌ |
| Transfers | ✅ | ✅ | ❌ | ❌ |
| ReceivablesLite (CxC) | ✅ | ✅ | ❌ | ❌ |
| PayablesLite (CxP) | ✅ | ✅ | ❌ | ❌ |
| ReconciliationSessions | ❌ | ❌ | ❌ | ❌ |
| BalanceSnapshots | ✅ (último) | ❌ | ❌ | ❌ |
| BalanceSummary | ✅ (caché) | N/A | N/A | N/A |
| Adjuntos (movimientos) | ✅ (local) | ✅ (encolado) | ❌ | ❌ |

---

## Operaciones bloqueadas — detalle y UX

| Operación | Razón técnica | UX en modo offline |
|-----------|-------------|-------------------|
| Crear cuenta bancaria | Validación de unicidad en servidor | Botón oculto (`mode: 'hide'`) |
| Editar cualquier registro | Riesgo de conflicto con estado del servidor | Botón oculto (`mode: 'hide'`) |
| Eliminar (soft-delete) | Inconsistencia si el registro fue modificado online | Botón oculto (`mode: 'hide'`) |
| Reconciliación completa | Requiere comparar partidas del servidor en tiempo real | Página bloqueada (`OfflineBlockedPage`) |
| Aprobar/rechazar transferencia | Requiere flujo de autorización con estado del servidor | Botón deshabilitado + tooltip |
| Registrar corte de saldo | Corte contable oficial — solo en online | Botón deshabilitado + tooltip |
| KPI "Vencidas" (CxC/CxP) | Endpoint de conteo en servidor | Muestra `N/D` con indicador offline |
| Balance en tiempo real | Requiere cálculo del servidor | Muestra último saldo conocido con `lastSyncedAt` |

---

## Constantes de código

Definidas en `apps/desktop/src/modules/finops/offline-contract.ts`:

```typescript
export const FINOPS_OFFLINE_ALLOWED_OPS = [
  'movement.create',
  'transfer.create',
  'receivable.create',
  'payable.create',
  'attachment.create', // solo para movimientos
] as const;

export const FINOPS_OFFLINE_BLOCKED_OPS = [
  'bank_account.create',
  'bank_account.update',
  'bank_account.delete',
  'movement.update',
  'movement.delete',
  'transfer.update',
  'transfer.delete',
  'transfer.approve',
  'transfer.reject',
  'receivable.update',
  'receivable.delete',
  'payable.update',
  'payable.delete',
  'reconciliation.*',
  'balance_snapshot.create',
] as const;
```

---

## Comportamiento del caché por entidad

| Entidad | TTL de refresco | Estrategia de actualización | Ventana de datos |
|---------|---------------|---------------------------|-----------------|
| BankAccounts | 1 hora | Reemplazo completo | Todas las activas |
| FinancialMovements | 1 hora | Reemplazo completo | Últimos 90 días |
| Transfers | 1 hora | Reemplazo completo | Últimas 90 días |
| CxC (Receivables) | 1 hora | Reemplazo completo | Sin límite de tiempo |
| CxP (Payables) | 1 hora | Reemplazo completo | Sin límite de tiempo |
| BalanceSummary | 30 minutos | Reemplazo completo | Resumen actual |
| BalanceSnapshots | 1 hora | Reemplazo completo | Último snapshot |

---

## Indicadores visuales offline

| Situación | Indicador |
|-----------|----------|
| Modo offline activo | `OfflineBanner` en la parte superior del layout |
| Dato del caché | Timestamp "Datos al [fecha]" en el header de página |
| Dato del caché desactualizado (> 24h) | Advertencia naranja junto al timestamp |
| Operación pendiente de sync | Badge `PENDING_SYNC` en el registro |
| Error de sync | Badge `SYNC_ERROR` + acción de reintento |
| Métrica no disponible offline | Texto `N/D` con tooltip explicativo |

---

## Estado del documento

- **Estado**: Aprobado en T-1516
- **Versión**: 1.0
- **Fecha**: 2026-04-14
- **Fase origen**: Fase 15 (T-1500 / T-1501)
- **Revisión siguiente**: al inicio de Fase 17 (cuando se implementen conflictos de merge)
