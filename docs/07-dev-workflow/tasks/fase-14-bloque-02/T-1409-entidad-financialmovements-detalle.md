# T-1409 - Entidad FinancialMovements: detalle

## Metadatos
- ID: `T-1409`
- Fase: `Fase 14`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar la vista de detalle de un movimiento financiero, mostrando todos los datos del movimiento, sus comprobantes adjuntos y las acciones disponibles según el estatus del movimiento.

## Alcance
- Crear página `FinancialMovementDetailPage` en `/finops/movements/:id`.
- Secciones:
  - Encabezado: tipo (badge), monto, moneda, fecha, estatus, conciliado.
  - Información: cuenta bancaria, sucursal, descripción, referencia, notas.
  - Comprobantes adjuntos: lista de adjuntos con visor (T-1414 lo reutiliza).
  - Acciones: "Editar", "Anular", "Adjuntar comprobante".
- Integración con:
  - `GET /api/v1/financial-movements/:id`.
  - `GET /api/v1/financial-movements/:id/attachments`.
  - `POST /api/v1/financial-movements/:id/attachments/upload` (para adjuntar).

## Fuera de alcance
- Historial de cambios del movimiento (Fase 15+).
- Aprobación de movimiento (Fase 15+).

## Dependencias
- `T-1405`: lista de movimientos como punto de entrada.
- `T-1408`: formulario de edición/anulación.
- `T-1330`: endpoint de comprobantes disponible.

## Criterios de aceptación
- [x] Vista de detalle con todos los campos del movimiento.
- [x] Lista de comprobantes adjuntos.
- [x] Funcionalidad de adjuntar comprobante.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: detalle de movimiento demo con comprobantes.

## Pruebas
- Navegar a detalle de movimiento — todos los datos correctos.
- Adjuntar comprobante — aparece en la lista de adjuntos.
- Movimiento reconciliado — botón "Anular" deshabilitado con tooltip.
- Movimiento inexistente — pantalla de error 404.

## Riesgos
- **Upload de comprobante desde detalle**: el endpoint de upload espera un archivo, no solo metadata. El componente de upload debe manejar multipart o referencia a un adjunto ya existente. Mitigación: usar el patrón de dos pasos (subir adjunto → vincular).

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/MovementDetailPage.jsx`.

## Decisiones clave
- **Adjuntos como sección prominente**: los comprobantes son evidencia crítica de auditoría financiera. Se muestran como sección destacada en el detalle, no como un link secundario.
- **Acciones contextuales por estatus**: las acciones disponibles cambian según el estatus del movimiento (anulado, reconciliado). La UI evalúa el estatus al renderizar para mostrar/ocultar/deshabilitar acciones.

## Evidencia documental
- `apps/web/src/modules/finops/pages/MovementDetailPage.jsx`

## Pendientes para la siguiente task
- `T-1410` (Bloque 3) implementa el listado de transferencias.

## Pendientes no resueltos
- Ninguno.
