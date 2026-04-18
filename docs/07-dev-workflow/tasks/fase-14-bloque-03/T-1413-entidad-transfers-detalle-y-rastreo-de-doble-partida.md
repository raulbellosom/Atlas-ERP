# T-1413 - Entidad Transfers: detalle y rastreo de doble partida

## Metadatos
- ID: `T-1413`
- Fase: `Fase 14`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar la vista de detalle de una transferencia bancaria con rastreo de la doble partida contable (movimiento de salida y movimiento de entrada), permitiendo al usuario verificar la consistencia de la operación.

## Alcance
- Crear página `TransferDetailPage` en `/finops/transfers/:id`.
- Secciones:
  - Encabezado: monto, moneda, fecha, estatus (badge).
  - Cuentas: origen (saldo antes/después si disponible) y destino.
  - Doble partida: movimiento TRANSFER_OUT y movimiento TRANSFER_IN vinculados.
  - Acciones: aprobación (T-1412), anular transferencia.
- Integración con:
  - `GET /api/v1/transfers/:id`.
  - Movimientos vinculados via query de FinancialMovements.

## Fuera de alcance
- Rastreo de transferencias externas/internacionales (Fase 15+).
- Timeline completo de la transferencia (Fase 15+).

## Dependencias
- `T-1410`: listado como punto de entrada.
- `T-1412`: acciones de aprobación integradas.
- `T-1322`: endpoint `GET /api/v1/transfers/:id` disponible.

## Criterios de aceptación
- [x] Vista de detalle con doble partida visible.
- [x] Movimientos OUT/IN vinculados mostrados.
- [x] Acciones de aprobación integradas.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: detalle de transferencia demo con doble partida.

## Pruebas
- Navegar a detalle de transferencia — doble partida visible con movimientos vinculados.
- Transferencia sin movimientos vinculados (v1) — sección de doble partida muestra "Pendiente de registro".

## Riesgos
- **Transferencia sin movimientos en v1**: en v1, la creación de transferencia no genera automáticamente los movimientos OUT/IN. La UI debe manejar gracefully el caso donde no hay movimientos vinculados.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/TransferDetailPage.jsx` — archivo nuevo.

## Decisiones clave
- **Doble partida como sección prominente**: la transparencia contable es un requisito clave del módulo. Mostrar ambas partidas (salida y entrada) en el detalle permite al usuario verificar la integridad de la transferencia.
- **Movimientos vinculados como links**: cada movimiento de la doble partida tiene un link al detalle del movimiento correspondiente en `/finops/movements/:id`.

## Evidencia documental
- `apps/web/src/modules/finops/pages/TransferDetailPage.jsx`

## Pendientes para la siguiente task
- `T-1414` implementa el visor de adjuntos para movimientos y transferencias.

## Pendientes no resueltos
- Ninguno.
