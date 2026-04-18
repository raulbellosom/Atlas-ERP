# T-1407 - Entidad FinancialMovements: creación

## Metadatos
- ID: `T-1407`
- Fase: `Fase 14`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar el formulario de creación de movimientos financieros (ingresos y egresos), con selección de tipo, cuenta destino, monto y fecha, conectado al endpoint `POST /api/v1/financial-movements`.

## Alcance
- Crear página/modal `CreateFinancialMovementForm`.
- Campos: tipo (Select Radix — INCOME/EXPENSE), cuenta bancaria (Select), monto, moneda, fecha del movimiento (date picker), descripción/referencia, notas.
- Campos conditionales según tipo:
  - INCOME: fuente del ingreso (texto libre).
  - EXPENSE: categoría de gasto (Select Radix).
- Validación con react-hook-form + zod.
- Integración con `POST /api/v1/financial-movements` vía `useMutation`.
- Feedback: toast de éxito + invalidar cache de lista.

## Fuera de alcance
- Creación de transferencias entre cuentas (eso es T-1411).
- Upload de comprobante al momento de creación (puede hacerse desde el detalle T-1409).
- Tipos TRANSFER_IN / TRANSFER_OUT en este formulario (se crean via transferencias).

## Dependencias
- `T-1405`, `T-1406`: página de listado disponible.
- `T-1321`: endpoint `POST /api/v1/financial-movements` disponible.

## Criterios de aceptación
- [x] Formulario de creación con campos condicionales por tipo.
- [x] Select Radix UI para tipo y cuenta.
- [x] Validación frontend funcional.
- [x] Integración con API.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: creación de ingreso y egreso demo exitosa.

## Pruebas
- Seleccionar tipo INCOME — campos de ingreso visibles.
- Seleccionar tipo EXPENSE — campos de egreso visibles.
- Enviar sin monto — error inline.
- Crear movimiento exitosamente — toast + aparece en lista.

## Riesgos
- **Monto como número flotante**: el campo de monto en el formulario es un `<input type="number">`. Debe manejar correctamente decimales y enviar como `number` al API.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/CreateMovementPage.jsx`.
- `apps/web/src/modules/finops/hooks/useCreateMovement.js`.

## Decisiones clave
- **Campos condicionales por tipo**: en lugar de tener un formulario genérico, los campos relevantes se muestran/ocultan según el tipo de movimiento seleccionado. Esto reduce la complejidad visual y los errores de campo.
- **TRANSFER_IN/OUT excluidos**: los movimientos de tipo transferencia se crean via el asistente de transferencias (T-1411), no desde este formulario.

## Evidencia documental
- `apps/web/src/modules/finops/pages/CreateMovementPage.jsx`
- `apps/web/src/modules/finops/hooks/useCreateMovement.js`

## Pendientes para la siguiente task
- `T-1408` implementa la anulación y edición de movimientos.

## Pendientes no resueltos
- Ninguno.
