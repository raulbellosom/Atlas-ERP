# T-1402 - Entidad BankAccounts: creación

## Metadatos
- ID: `T-1402`
- Fase: `Fase 14`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar el formulario de creación de cuentas bancarias en la interfaz web, con validación de campos, selector de tipo de cuenta con Radix UI y conexión al endpoint `POST /api/v1/bank-accounts`.

## Alcance
- Crear página/modal `CreateBankAccountForm` accesible desde el listado.
- Campos del formulario: nombre, tipo de cuenta (Select Radix), número de cuenta, saldo inicial, moneda (Select), sucursal (Select), notas.
- Validación frontend con react-hook-form + zod.
- Integración con `POST /api/v1/bank-accounts` vía `useMutation` de react-query.
- Feedback al usuario: toast de éxito, errores inline en campos inválidos.
- Al crear exitosamente: invalidar cache de lista y navegar de vuelta al listado.

## Fuera de alcance
- Validación de número de cuenta duplicado en frontend (eso retorna 409 desde backend).
- Selección de sucursal con filtro por organización en tiempo real (Fase 15+).

## Dependencias
- `T-1401`: listado desde donde se accede al formulario.
- `T-1320`: endpoint `POST /api/v1/bank-accounts` disponible.
- Componentes `Select` de Radix UI instalado en el proyecto.

## Criterios de aceptación
- [x] Formulario de creación implementado con todos los campos.
- [x] Validación frontend con zod/react-hook-form funcional.
- [x] Select de Radix UI para tipo de cuenta y moneda.
- [x] Integración con API via react-query.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: creación de cuenta demo exitosa con feedback visual.

## Pruebas
- Enviar formulario sin nombre — mostrar error inline "Nombre requerido".
- Seleccionar tipo "CORRIENTE" en Select Radix — valor correcto se envía al API.
- Crear cuenta exitosamente — toast de éxito + navegación a listado + cuenta aparece en lista.
- Error 409 (duplicado) — mostrar mensaje de error al usuario.

## Riesgos
- **Select de Radix UI para enums**: los valores del enum `BankAccountType` deben mapearse correctamente a las opciones del Select. Si el diccionario no incluye todos los valores, algunos tipos no aparecen como opciones.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/CreateBankAccountPage.jsx` (o modal).
- `apps/web/src/modules/finops/hooks/useCreateBankAccount.js` — hook de mutación.

## Decisiones clave
- **Select Radix UI para enums**: como se documenta en las Notas Técnicas, los Select de Radix UI se usan para todos los campos de tipo enum, proporcionando accesibilidad (ARIA) y consistencia visual con el design system.
- **Invalidación de cache post-creación**: tras una creación exitosa, se invalida la query del listado con `queryClient.invalidateQueries(['bank-accounts'])` para que la lista se actualice automáticamente.

## Evidencia documental
- `apps/web/src/modules/finops/pages/CreateBankAccountPage.jsx`
- `apps/web/src/modules/finops/hooks/useCreateBankAccount.js`

## Pendientes para la siguiente task
- `T-1403` implementa el formulario de edición de cuentas.

## Pendientes no resueltos
- Ninguno.
