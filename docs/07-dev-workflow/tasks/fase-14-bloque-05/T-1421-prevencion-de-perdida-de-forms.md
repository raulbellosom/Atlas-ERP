# T-1421 - Prevención de pérdida de forms (useUnsavedChanges)

## Metadatos
- ID: `T-1421`
- Fase: `Fase 14`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar el hook `useUnsavedChanges` que intercepta la navegación y el cierre de pestaña cuando el usuario tiene cambios sin guardar en un formulario, mostrando un diálogo de confirmación antes de abandonar.

## Alcance
- Crear hook `useUnsavedChanges(isDirty: boolean)` que:
  - Usa `useBlocker` de React Router v6 para interceptar navegación interna.
  - Registra el listener `beforeunload` para interceptar cierre de pestaña o recarga.
  - Expone `{ blocker, confirmLeave, cancelLeave }` para controlar el diálogo.
- Crear componente `UnsavedChangesDialog` que consume el hook y muestra modal de confirmación.
- Integrar `useUnsavedChanges` en todos los formularios de creación y edición del módulo:
  - `CreateBankAccountForm`, `EditBankAccountForm`
  - `CreateMovementForm`, `EditMovementPage`
  - `CreateTransferWizard`
  - `ReconciliationPage` (formulario de nueva sesión)
  - `ReceivablesPage`, `PayablesPage` (formularios de CxC/CxP)
- Conectar el `isDirty` del hook con `formState.isDirty` de react-hook-form.

## Fuera de alcance
- Guardado automático en borrador (autosave — Fase 15+).
- Persistencia de formulario en localStorage al recargar (Fase 15+).

## Dependencias
- `T-1402` a `T-1412`, `T-1415`, `T-1418`: todos los formularios de creación y edición implementados.
- React Router v6.4+ (provee `useBlocker`).

## Criterios de aceptación
- [x] Hook `useUnsavedChanges` creado y funcional.
- [x] Diálogo de confirmación aparece al intentar navegar con cambios sin guardar.
- [x] `beforeunload` activo para cierre de pestaña/recarga.
- [x] Integrado en todos los formularios del módulo.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: modificar campo en formulario → navegar a otra ruta → diálogo aparece.

## Pruebas
- Modificar campo en `CreateBankAccountForm` → hacer clic en enlace del sidebar → diálogo "¿Salir sin guardar?".
- Confirmar salida → navega y descarta cambios.
- Cancelar salida → permanece en el formulario con cambios intactos.
- Formulario limpio (sin `isDirty`) → navegación procede sin diálogo.
- Recargar pestaña con cambios → navegador muestra advertencia nativa.

## Riesgos
- **`useBlocker` disponible desde React Router v6.4**: verificar que la versión instalada lo soporte. Si es anterior, usar `unstable_useBlocker` o implementar alternativa con `history.listen`.
- **Diálogo en formularios multi-paso (wizard)**: el wizard de transferencias tiene pasos. `isDirty` debe considerar cambios en cualquier paso, no solo el actual.

## Documentación a actualizar
- `apps/web/src/modules/finops/hooks/useUnsavedChanges.js` — archivo nuevo.
- `apps/web/src/modules/finops/components/UnsavedChangesDialog.jsx` — archivo nuevo.

## Decisiones clave
- **Hook en lugar de HOC o context**: el hook es más ergonómico con react-hook-form ya que `formState.isDirty` se consume directamente. Un HOC requeriría más boilerplate y acoplamiento.
- **`beforeunload` solo cuando `isDirty` es `true`**: el listener se agrega y remueve dinámicamente para evitar advertencias en navegación normal.

## Evidencia documental
- `apps/web/src/modules/finops/hooks/useUnsavedChanges.js`
- `apps/web/src/modules/finops/components/UnsavedChangesDialog.jsx`

## Pendientes para la siguiente task
- `T-1422` implementa los validadores preventivos de seguridad en requests.

## Pendientes no resueltos
- Ninguno.
