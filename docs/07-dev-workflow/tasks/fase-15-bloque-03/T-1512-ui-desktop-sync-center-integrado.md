# T-1512 - Crear UI desktop del Sync Center integrada al módulo

## Metadatos
- ID: `T-1512`
- Fase: `Fase 15`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Integrar el panel de sincronización FinOps en el Sync Center global del desktop y crear el layout desktop completo del módulo FinOps, con acceso rápido al estado de sync, el banner offline y la cola de pendientes visible en todo momento.

## Alcance
- Crear `FinOpsDesktopLayout` en `apps/desktop/src/modules/finops/layouts/`:
  - Sidebar del módulo con los mismos 7 ítems de navegación que `FinOpsLayout` web.
  - Sección inferior del sidebar: `FinOpsSyncQueuePanel` colapsable con badge de pendientes.
  - `OfflineBanner` integrado en la zona superior (debajo de la topbar).
  - `FinOpsBootRecoveryNotification` para el mensaje de recovery al iniciar.
- Registrar `FinOpsDesktopLayout` como layout de las rutas FinOps en el router desktop.
- Conectar `FinOpsSyncQueuePanel` al Sync Center global:
  - El Sync Center global del desktop (T-1029) muestra una sección "FinOps" con el resumen de la cola.
  - Clic en "Ver detalle" navega al panel lateral del módulo.
- Indicador de sync activo: spinner animado en el badge cuando hay ítems en estado `SYNCING`.

## Fuera de alcance
- Sincronización de otros módulos en el Sync Center (cada módulo gestiona su propia sección).
- Configuración de política de reintentos desde la UI (hardening Fase 17+).

## Dependencias
- `T-1510`: `FinOpsSyncQueuePanel` implementado.
- `T-1511`: `useFinOpsBootRecovery` implementado.
- `T-1029`: Sync Center global desktop disponible para integrar la sección FinOps.
- `T-1400`: `FinOpsLayout` web como referencia para la navegación del módulo.

## Criterios de aceptación
- [ ] `FinOpsDesktopLayout` con sidebar, offline banner y sync panel integrados.
- [ ] Badge de pendientes visible en todas las páginas del módulo.
- [ ] Sección "FinOps" en el Sync Center global con resumen de cola.
- [ ] `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.

## Validaciones
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.
- Revisión manual: walkthrough completo del módulo desktop — todas las páginas muestran el badge de sync y el banner offline cuando corresponde.

## Pruebas
- Online con cola vacía → badge oculto, panel colapsado.
- Offline con 3 ítems → badge "3", panel expandido automáticamente.
- Sync activo → spinner en badge + "Sincronizando..." en panel.
- Sync Center global → sección "FinOps" muestra "3 pendientes".

## Riesgos
- **Divergencia entre layout web y desktop**: el layout desktop es una adaptación del web. Si en el futuro se agregan páginas al módulo web (T-1416+), el layout desktop debe actualizarse manualmente. Mitigación: documentar que ambos layouts deben mantenerse en sync en los PR que agreguen páginas al módulo.

## Documentación a actualizar
- `apps/desktop/src/modules/finops/layouts/FinOpsDesktopLayout.tsx` — archivo nuevo.
- `apps/desktop/src/router/finops.routes.tsx` — registro de rutas con el nuevo layout.

## Decisiones clave
- **Panel de sync en sidebar inferior, no flotante**: integrar el panel como parte del sidebar (sección inferior) es menos intrusivo que un modal flotante. El usuario puede trabajar normalmente y consultar el estado de sync de un vistazo lateral.
- **Badge oculto cuando la cola está vacía**: mostrar un badge "0" permanentemente añade ruido visual. El badge solo aparece cuando hay ítems pendientes o en error.

## Evidencia documental
- `apps/desktop/src/modules/finops/layouts/FinOpsDesktopLayout.tsx`
- `apps/desktop/src/router/finops.routes.tsx`

## Pendientes para la siguiente task
- `T-1513` implementa la gestión de adjuntos en modo offline.

## Pendientes no resueltos
- Ninguno.
