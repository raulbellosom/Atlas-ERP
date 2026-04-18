# T-1411 - Entidad Transfers: creación (asistente)

## Metadatos
- ID: `T-1411`
- Fase: `Fase 14`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar el asistente de creación de transferencias entre cuentas bancarias, con validación de que las cuentas origen y destino son diferentes y presentando un resumen antes de confirmar.

## Alcance
- Crear asistente (multi-paso o formulario single-page) `CreateTransferWizard`.
- Paso 1: selección de cuenta origen (Select con saldo actual).
- Paso 2: selección de cuenta destino (Select — excluye cuenta origen).
- Paso 3: monto, moneda, fecha, referencia, notas.
- Paso 4 (resumen): confirmar datos antes de enviar.
- Validación frontend: cuenta origen ≠ destino, monto > 0.
- Integración con `POST /api/v1/transfers` vía `useMutation`.
- Al crear: invalidar cache de lista de transferencias.

## Fuera de alcance
- Validación de saldo suficiente en frontend (el backend retorna error si no hay saldo — Fase 15).
- Conversión de moneda (ambas cuentas deben tener la misma moneda en v1).

## Dependencias
- `T-1410`: listado disponible.
- `T-1322`: endpoint `POST /api/v1/transfers` disponible.
- `T-1325`: endpoint de balance para mostrar saldo de cuenta origen.

## Criterios de aceptación
- [x] Asistente de transferencia con pasos de selección y confirmación.
- [x] Select de cuenta origen muestra saldo actual.
- [x] Validación cuenta origen ≠ destino.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: creación de transferencia demo exitosa con resumen.

## Pruebas
- Seleccionar misma cuenta en origen y destino — error de validación.
- Completar todos los pasos — resumen muestra datos correctos.
- Confirmar transferencia — aparece en lista con estatus PENDING.

## Riesgos
- **Saldo de cuenta origen no disponible en tiempo real**: si el saldo cambia entre la carga del asistente y la confirmación, el usuario puede ver saldo desactualizado. Mitigación: mostrar advertencia de que el saldo es referencial.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/CreateTransferPage.jsx`.
- `apps/web/src/modules/finops/hooks/useCreateTransfer.js`.

## Decisiones clave
- **Asistente multi-paso**: el flujo de transferencia es más complejo que un CRUD simple porque implica dos cuentas y requiere confirmación explícita. El asistente guía al usuario y reduce errores.
- **Resumen antes de confirmar**: una transferencia es una operación financiera con consecuencias. El paso de resumen permite al usuario verificar los datos antes de ejecutar.

## Evidencia documental
- `apps/web/src/modules/finops/pages/CreateTransferPage.jsx`
- `apps/web/src/modules/finops/hooks/useCreateTransfer.js`

## Pendientes para la siguiente task
- `T-1412` implementa el flujo de aprobación de transferencias.

## Pendientes no resueltos
- Ninguno.
