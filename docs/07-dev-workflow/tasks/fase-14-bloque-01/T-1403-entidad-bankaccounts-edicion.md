# T-1403 - Entidad BankAccounts: edición

## Metadatos
- ID: `T-1403`
- Fase: `Fase 14`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar el formulario de edición de cuentas bancarias existentes, pre-poblando los campos con los datos actuales de la cuenta y conectando con el endpoint `PATCH /api/v1/bank-accounts/:id`.

## Alcance
- Crear página/modal `EditBankAccountForm` accesible desde el listado o detalle.
- Pre-poblar formulario con datos actuales de la cuenta (via `useQuery` o props).
- Mismos campos que el formulario de creación, con datos actuales como valores iniciales.
- Validación frontend con react-hook-form + zod (mismas reglas que creación).
- Integración con `PATCH /api/v1/bank-accounts/:id` vía `useMutation`.
- Feedback: toast de éxito, errores inline. Al guardar: invalidar cache y navegar.
- Botón de soft-delete que abre diálogo de confirmación antes de `DELETE /api/v1/bank-accounts/:id`.

## Fuera de alcance
- Cambio de saldo directo desde edición (el saldo se actualiza vía movimientos, no directo).
- Historial de cambios de la cuenta (Fase 15+).

## Dependencias
- `T-1401`: listado desde donde se accede a edición.
- `T-1402`: formulario de creación como referencia de estructura.
- `T-1320`: endpoints `PATCH` y `DELETE` disponibles.

## Criterios de aceptación
- [x] Formulario de edición pre-poblado con datos actuales.
- [x] Validación frontend funcional.
- [x] Integración con API PATCH via react-query.
- [x] Soft-delete con diálogo de confirmación funcional.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: edición de cuenta demo exitosa.

## Pruebas
- Abrir edición de cuenta existente — campos pre-poblados correctamente.
- Modificar nombre y guardar — cuenta actualizada en lista.
- Clic en "Eliminar" — diálogo de confirmación aparece.
- Confirmar eliminación — cuenta desaparece de lista (soft-deleted).

## Riesgos
- **Race condition entre pre-populate y edición**: si el usuario navega directamente a `/finops/bank-accounts/:id/edit` sin haber pasado por el listado, el formulario debe fetcher los datos del API. Mitigación: la página de edición hace su propio `useQuery` para obtener los datos.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/EditBankAccountPage.jsx`.
- `apps/web/src/modules/finops/hooks/useUpdateBankAccount.js`.

## Decisiones clave
- **Diálogo de confirmación antes de soft-delete**: dado el impacto financiero de eliminar una cuenta, se requiere confirmación explícita del usuario. El diálogo muestra el nombre de la cuenta y advierte sobre las consecuencias.

## Evidencia documental
- `apps/web/src/modules/finops/pages/EditBankAccountPage.jsx`
- `apps/web/src/modules/finops/hooks/useUpdateBankAccount.js`

## Pendientes para la siguiente task
- `T-1404` implementa la vista de detalle de cuenta.

## Pendientes no resueltos
- Ninguno.
