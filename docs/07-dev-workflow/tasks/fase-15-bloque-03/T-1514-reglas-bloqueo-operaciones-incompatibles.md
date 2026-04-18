# T-1514 - Crear reglas para bloquear operaciones incompatibles offline

## Metadatos
- ID: `T-1514`
- Fase: `Fase 15`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar la capa de UX que bloquea o adapta las operaciones no permitidas en modo offline (definidas en T-1501), garantizando que el usuario recibe mensajes claros sobre qué puede y qué no puede hacer sin conexión, y por qué.

## Alcance
- Crear componente `OfflineBlockedAction` en `apps/desktop/src/modules/finops/components/`:
  - Props: `reason: string`, `children: ReactNode`, `mode: 'hide' | 'disable'`.
  - En online: renderiza `children` normalmente.
  - En offline + `mode: 'hide'`: no renderiza nada.
  - En offline + `mode: 'disable'`: renderiza `children` con `disabled` + Tooltip con el `reason`.
- Aplicar `OfflineBlockedAction` a cada operación bloqueada:
  - Botón "Nueva cuenta bancaria" → `mode: 'hide'`.
  - Botones "Editar" y "Eliminar" en todos los registros → `mode: 'hide'`.
  - Botón "Aprobar transferencia" → `mode: 'disable'` con reason "La aprobación requiere conexión".
  - Botón "Registrar corte" (BalancePage) → `mode: 'disable'` con reason "El corte de saldo requiere conexión".
  - Página `ReconciliationPage` en offline → banner `OfflineBlockedPage` con mensaje "La conciliación bancaria no está disponible sin conexión".
- Crear `OfflineBlockedPage` para páginas completas no disponibles offline:
  - Muestra ícono, mensaje y botón "Reintentar cuando haya conexión".

## Fuera de alcance
- Bloqueo de operaciones por permisos de usuario (ya manejado por `@RequireAllPermissions` — Fase 13).
- Mensaje de bloqueo offline en la web (en la web solo existe `OfflineBanner` — T-1420).

## Dependencias
- `T-1500` / `T-1501`: contrato de operaciones permitidas/bloqueadas definido.
- `T-1420`: `useNetworkStatus` hook disponible.
- `T-1510` a `T-1512`: layout desktop completo donde se aplican los bloqueos.

## Criterios de aceptación
- [ ] `OfflineBlockedAction` implementado con modos `hide` y `disable`.
- [ ] `OfflineBlockedPage` implementado para `ReconciliationPage`.
- [ ] Todos los botones bloqueados en T-1501 usan `OfflineBlockedAction`.
- [ ] `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.

## Validaciones
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.
- Revisión manual (offline): recorrer todas las páginas del módulo desktop → verificar que ningún botón de operación bloqueada es accionable.

## Pruebas
- Offline → `BankAccountsPage` → botón "Nueva cuenta" no visible.
- Offline → cualquier fila de tabla → botones "Editar" y "Eliminar" no visibles.
- Offline → `TransfersPage` → botón "Aprobar" deshabilitado con tooltip "La aprobación requiere conexión".
- Offline → navegar a `ReconciliationPage` → `OfflineBlockedPage` con mensaje claro.
- Reconectar → todos los botones reaparecen o se habilitan sin recargar la página.

## Riesgos
- **Botón reaparece al reconectar sin refresco**: `useNetworkStatus` usa eventos del DOM (`online`/`offline`) para actualizar el estado. Si el componente no rerenderiza al reconectar, los botones permanecen ocultos. Mitigación: verificar que `useNetworkStatus` provoca un rerrender correcto en todos los componentes que consumen `OfflineBlockedAction`.

## Documentación a actualizar
- `apps/desktop/src/modules/finops/components/OfflineBlockedAction.tsx` — archivo nuevo.
- `apps/desktop/src/modules/finops/components/OfflineBlockedPage.tsx` — archivo nuevo.

## Decisiones clave
- **`mode: 'hide'` por defecto para operaciones de escritura**: ocultar es más claro que deshabilitar para la mayoría de las operaciones de escritura. Un botón deshabilitado permanentemente invita al usuario a buscar por qué no funciona; un botón ausente no genera esa fricción.
- **`mode: 'disable'` solo cuando hay una acción pendiente visible**: la aprobación de transferencias usa `disable` porque la transferencia existe y el usuario sabe que puede aprobarla — solo necesita conexión. No hay ambigüedad sobre por qué no puede hacerlo.

## Evidencia documental
- `apps/desktop/src/modules/finops/components/OfflineBlockedAction.tsx`
- `apps/desktop/src/modules/finops/components/OfflineBlockedPage.tsx`

## Pendientes para la siguiente task
- `T-1515` (Bloque 4) implementa las pruebas del flujo offline → sync del módulo.

## Pendientes no resueltos
- Ninguno.
