# T-1506 - Crear formularios desktop con persistencia local

## Metadatos
- ID: `T-1506`
- Fase: `Fase 15`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Adaptar los formularios de creación del módulo FinOps para la aplicación desktop, agregando persistencia local del borrador en SQLite para que el usuario no pierda los datos ingresados si la app se cierra o la conexión se interrumpe durante el llenado.

## Alcance
- Crear tabla `finops_form_drafts` en SQLite:
  - Columnas: `id`, `formType` (movement|transfer|receivable|payable), `payload TEXT`, `createdAt`, `updatedAt`.
- Crear hook `useFormDraft(formType)`:
  - Al montar: recupera el borrador guardado de `finops_form_drafts`.
  - Al cambiar cualquier campo: guarda el borrador (debounce 1s).
  - Al submit exitoso: elimina el borrador.
  - Al desmontar sin submit: el borrador permanece para recuperación.
- Adaptar formularios desktop:
  - `CreateMovementFormDesktop` — usa `useFormDraft('movement')`.
  - `CreateTransferWizardDesktop` — persiste el estado de cada paso del wizard.
  - `CreateReceivableFormDesktop` — usa `useFormDraft('receivable')`.
  - `CreatePayableFormDesktop` — usa `useFormDraft('payable')`.
- Mostrar banner "Tienes un borrador guardado" al abrir el formulario si existe un draft.

## Fuera de alcance
- Persistencia de formularios de edición (no permitidos en offline — T-1501).
- Sync de borradores al servidor (los borradores son locales — no se sincronizan).
- Múltiples borradores simultáneos por tipo (solo 1 borrador activo por formType).

## Dependencias
- `T-1502`: acceso a SQLite disponible.
- `T-1407`, `T-1411`, `T-1418`: formularios web como base de las versiones desktop.
- `T-1421`: `useUnsavedChanges` web como referencia para el patrón de recuperación de formulario.

## Criterios de aceptación
- [x] Migración `006_finops_form_drafts` agregada a `LOCAL_MIGRATIONS` en `commands.rs`.
- [x] Hook `useFormDraft` implementado en `apps/desktop/src/modules/finops/hooks/useFormDraft.js` con debounce 1s y TTL 7 días.
- [x] Los 4 formularios desktop creados: `CreateMovementFormDesktop`, `CreateTransferWizardDesktop`, `CreateReceivableFormDesktop`, `CreatePayableFormDesktop`.
- [x] Banner "Borrador guardado" con botón "Descartar" en todos los formularios.
- [x] `pnpm --filter @atlasrep/desktop run lint`: 0 errores.

## Validaciones
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.
- Revisión manual: llenar formulario parcialmente → cerrar app → reabrir → banner "Borrador guardado" visible con los datos ingresados.

## Pruebas
- Llenar mitad del formulario de movimiento → cerrar app abruptamente → reabrir → datos recuperados.
- Submit exitoso → borrador eliminado → próxima apertura no muestra banner.
- Borrador con más de 7 días → se elimina automáticamente (TTL de draft).

## Riesgos
- **Borrador obsoleto con selects inválidos**: si el usuario guardó un borrador con `bankAccountId: X` y esa cuenta fue eliminada en el backend, el select pre-poblado fallará al cargar. Mitigación: al recuperar el borrador, validar que las referencias (cuentas, contraparte) siguen existiendo en el caché local.

## Documentación a actualizar
- `apps/desktop/src-tauri/migrations/finops/003_finops_form_drafts.sql` — tabla de borradores.
- `apps/desktop/src/modules/finops/hooks/useFormDraft.ts` — archivo nuevo.
- `apps/desktop/src/pages/finops/CreateMovementFormDesktop.tsx` — archivo nuevo.
- `apps/desktop/src/pages/finops/CreateTransferWizardDesktop.tsx` — archivo nuevo.
- `apps/desktop/src/pages/finops/CreateReceivableFormDesktop.tsx` — archivo nuevo.
- `apps/desktop/src/pages/finops/CreatePayableFormDesktop.tsx` — archivo nuevo.

## Decisiones clave
- **Debounce de 1s para guardar borrador**: guardar en cada keystroke sería costoso. 1s de debounce garantiza que el borrador está actualizado sin saturar el acceso a SQLite.
- **Un solo borrador activo por tipo de formulario**: si el usuario abre el formulario de movimiento dos veces sin completar el primero, el segundo sobreescribe el borrador. Esto simplifica la gestión. Si en el futuro se necesitan múltiples borradores, se agrega un índice por sesión.

## Evidencia documental
- `apps/desktop/src/modules/finops/hooks/useFormDraft.ts`
- `apps/desktop/src/pages/finops/CreateMovementFormDesktop.tsx`
- `apps/desktop/src/pages/finops/CreateTransferWizardDesktop.tsx`

## Pendientes para la siguiente task
- `T-1507` implementa el enqueue local de movimientos offline.

## Pendientes no resueltos
- Ninguno.
