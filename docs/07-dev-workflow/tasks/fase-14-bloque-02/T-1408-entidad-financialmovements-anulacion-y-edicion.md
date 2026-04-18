# T-1408 - Entidad FinancialMovements: anulación y edición

## Metadatos
- ID: `T-1408`
- Fase: `Fase 14`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar las acciones de edición de datos y anulación (soft-delete) de movimientos financieros desde la interfaz web, con las confirmaciones y restricciones necesarias para proteger la integridad del registro.

## Alcance
- Formulario de edición de movimiento (pre-poblado): descripción, referencia, notas, fecha.
- Restricción de edición: no se permite modificar monto, tipo ni cuenta si el movimiento está reconciliado.
- Acción de anulación: botón "Anular movimiento" con diálogo de confirmación.
- El diálogo de anulación muestra: monto, tipo y fecha del movimiento.
- Integración con `PATCH /api/v1/financial-movements/:id` y `DELETE /api/v1/financial-movements/:id`.
- Feedback: toast de éxito/error.

## Fuera de alcance
- Re-activación de movimientos anulados (no disponible en v1).
- Aprobación de movimiento por gerente (Fase 15+).

## Dependencias
- `T-1409`: accesible desde detalle de movimiento.
- `T-1321`: endpoints `PATCH` y `DELETE` disponibles.

## Criterios de aceptación
- [x] Edición de campos no críticos funcional.
- [x] Campos bloqueados si movimiento reconciliado.
- [x] Diálogo de confirmación de anulación implementado.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: anulación de movimiento demo funcional.

## Pruebas
- Abrir edición de movimiento no reconciliado — todos los campos editables.
- Intentar modificar monto en movimiento reconciliado — campo deshabilitado.
- Clic en "Anular" — diálogo de confirmación con datos del movimiento.
- Confirmar anulación — movimiento muestra estatus "ANULADO" en lista.

## Riesgos
- **Movimiento ya reconciliado**: si el usuario intenta anular un movimiento reconciliado, el backend puede retornar un error de negocio. La UI debe manejar ese error con mensaje claro.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/EditMovementPage.jsx`.
- `apps/web/src/modules/finops/hooks/useUpdateMovement.js`.

## Decisiones clave
- **Restricción de campos según estado de reconciliación**: los campos financieramente sensibles (monto, tipo, cuenta) se bloquean si el movimiento ya está reconciliado. Esto previene inconsistencias contables post-cierre.
- **"Anular" en lugar de "Eliminar"**: el lenguaje financiero usa "anular" para indicar que el movimiento queda en el historial como nulo. En la UI se usa "Anular" en lugar de "Eliminar" para reflejar la semántica correcta.

## Evidencia documental
- `apps/web/src/modules/finops/pages/EditMovementPage.jsx`
- `apps/web/src/modules/finops/hooks/useUpdateMovement.js`

## Pendientes para la siguiente task
- `T-1409` implementa la vista de detalle de movimiento con comprobantes.

## Pendientes no resueltos
- Ninguno.
