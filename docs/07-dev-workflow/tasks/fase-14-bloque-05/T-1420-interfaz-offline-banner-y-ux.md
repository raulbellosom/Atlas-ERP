# T-1420 - Interfaz: Offline Banner y UX

## Metadatos
- ID: `T-1420`
- Fase: `Fase 14`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar el banner de estado offline que se muestra cuando el usuario pierde conectividad a internet, garantizando que el módulo FinOps comunique claramente la falta de red sin bloquear la navegación ni perder el estado de la interfaz.

## Alcance
- Crear componente `OfflineBanner` que:
  - Detecta el estado de red mediante `navigator.onLine` y los eventos `online`/`offline` del `window`.
  - Muestra un banner persistente en la parte superior del módulo mientras no hay conexión.
  - Desaparece automáticamente al recuperar conectividad.
- Crear hook `useNetworkStatus()` que encapsula la lógica de detección.
- Integrar `OfflineBanner` dentro de `FinOpsLayout` para cobertura total del módulo.
- Deshabilitar botones de acción (submit, confirm, retry) mientras no hay red.

## Fuera de alcance
- Cache offline de datos ya cargados (requiere Service Worker — Fase 15+).
- Sincronización de cambios realizados offline (Fase 15+).
- Detección de degradación parcial de red (latencia alta — Fase 15+).

## Dependencias
- `T-1400`: FinOpsLayout disponible para integrar el banner.
- `T-1419`: Componentes de estado (LoadingSkeleton, EmptyState, ErrorState) implementados.

## Criterios de aceptación
- [x] Banner visible automáticamente al desconectar red.
- [x] Banner desaparece al reconectar.
- [x] Botones de acción deshabilitados en estado offline.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: desconectar red → banner visible; reconectar → banner oculto.

## Pruebas
- DevTools → Network → Offline — banner aparece en menos de 500ms.
- Botón "Guardar" en formulario abierto — aparece deshabilitado con tooltip "Sin conexión".
- Reconectar red — banner desaparece sin recargar la página.
- Navegar entre páginas del módulo en estado offline — layout mantiene el banner.

## Riesgos
- **Falsos negativos de `navigator.onLine`**: en algunos entornos corporativos, `navigator.onLine` puede reportar `true` aunque el acceso a internet esté bloqueado. Mitigación: el `ErrorState` con retry actúa como respaldo visual.

## Documentación a actualizar
- `apps/web/src/modules/finops/components/OfflineBanner.jsx` — archivo nuevo.
- `apps/web/src/modules/finops/hooks/useNetworkStatus.js` — archivo nuevo.
- `apps/web/src/modules/finops/layouts/FinOpsLayout.jsx` — integrar `OfflineBanner`.

## Decisiones clave
- **Banner en layout, no en cada página**: integrarlo en `FinOpsLayout` garantiza cobertura en todo el módulo con una sola instancia. Repetirlo en cada página sería redundante y propenso a omisiones.
- **Deshabilitar acciones, no bloquear navegación**: el usuario debe poder seguir navegando y leyendo datos ya cargados. Solo se bloquean las acciones que requerirían conectividad.

## Evidencia documental
- `apps/web/src/modules/finops/components/OfflineBanner.jsx`
- `apps/web/src/modules/finops/hooks/useNetworkStatus.js`

## Pendientes para la siguiente task
- `T-1421` implementa la prevención de pérdida de formularios con `useUnsavedChanges`.

## Pendientes no resueltos
- Ninguno.
