# T-1503 - Crear caché local de cuentas bancarias

## Metadatos
- ID: `T-1503`
- Fase: `Fase 15`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar la sincronización y lectura del caché local de cuentas bancarias en la aplicación desktop Tauri, permitiendo al usuario consultar el listado de cuentas sin conexión a internet.

## Alcance
- Crear hook `useBankAccountsDesktop()` en `apps/desktop/src/modules/finops/hooks/`:
  - En modo online: llama a `GET /api/v1/bank-accounts`, guarda resultado en SQLite (`finops_bank_accounts_cache`), retorna datos frescos.
  - En modo offline: lee directamente desde `finopsCache.getBankAccounts(organizationId)`.
  - Expone `{ data, isOffline, lastSyncedAt, refetch }`.
- Lógica de refresco:
  - Al detectar transición de offline → online: refresco automático.
  - Manual: botón "Actualizar" en la página.
  - Al abrir la app en modo online: refresco si `syncedAt` tiene más de 1 hora.
- Integrar `useBankAccountsDesktop` en `BankAccountsPage` del desktop.
- Mostrar `lastSyncedAt` en el header de la página cuando se está en modo offline.

## Fuera de alcance
- Crear cuentas bancarias en modo offline (no permitido — ver T-1500).
- Caché de movimientos por cuenta (T-1504).
- Caché de balance por cuenta (T-1505).

## Dependencias
- `T-1502`: tabla `finops_bank_accounts_cache` y comandos Tauri disponibles.
- `T-1401`: `BankAccountsPage` web implementada — la versión desktop la adapta.
- `T-1420`: `useNetworkStatus` hook disponible para detectar el estado de la red.

## Criterios de aceptación
- [x] Hook `useBankAccountsDesktop` implementado con lógica online/offline en `apps/desktop/src/modules/finops/hooks/useBankAccountsDesktop.js`.
- [x] Refresco automático al reconectar funcional (useEffect sobre `isOnline`).
- [x] `BankAccountsPage` desktop creada en `apps/desktop/src/pages/finops/BankAccountsPage.jsx` con `OfflineBanner` y `lastSyncedAt`.
- [x] `pnpm --filter @atlasrep/desktop run lint`: 0 errores. (Desktop es JS puro, sin typecheck.)

## Validaciones
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.
- Revisión manual: desconectar red → abrir página → cuentas visibles con timestamp "Última sincronización: hace X horas".

## Pruebas
- Online → cargar cuentas → desconectar → recargar página → cuentas visibles desde caché.
- Online → desconectar → reconectar → caché se actualiza automáticamente sin acción del usuario.
- Caché vacía + offline → página muestra `EmptyState` con mensaje "Sin datos locales. Conecta para sincronizar."

## Riesgos
- **Caché desactualizada mostrando cuentas eliminadas**: si una cuenta fue eliminada (soft-delete) en el servidor mientras el usuario estaba offline, la caché la seguirá mostrando. Mitigación: al refrescar, reemplazar el caché completo (no merge incremental) para garantizar consistencia.

## Documentación a actualizar
- `apps/desktop/src/modules/finops/hooks/useBankAccountsDesktop.ts` — archivo nuevo.
- `apps/desktop/src/pages/finops/BankAccountsPage.tsx` — adaptación de la página web para desktop.

## Decisiones clave
- **Reemplazo completo del caché, no merge incremental**: al sincronizar, se descarta el caché anterior y se reemplaza con los datos frescos del servidor. Esto es más costoso pero garantiza que el usuario no vea datos obsoletos (cuentas eliminadas, saldos incorrectos).
- **TTL de 1 hora para refresco automático**: 1 hora es un equilibrio entre mantener datos frescos y no saturar el API con requests automáticos en cada apertura de la app.

## Evidencia documental
- `apps/desktop/src/modules/finops/hooks/useBankAccountsDesktop.ts`
- `apps/desktop/src/pages/finops/BankAccountsPage.tsx`

## Pendientes para la siguiente task
- `T-1504` implementa el caché local de movimientos financieros.

## Pendientes no resueltos
- Ninguno.
