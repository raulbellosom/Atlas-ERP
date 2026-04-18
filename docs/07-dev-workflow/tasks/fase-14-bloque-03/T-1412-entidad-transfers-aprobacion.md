# T-1412 - Entidad Transfers: aprobación

## Metadatos
- ID: `T-1412`
- Fase: `Fase 14`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar el flujo de aprobación de transferencias pendientes en la interfaz web, permitiendo a usuarios autorizados aprobar o rechazar transferencias desde el listado o detalle.

## Alcance
- Botón "Aprobar" y "Rechazar" en la vista de detalle de transferencia (y opcionalmente en el listado).
- Diálogo de confirmación para aprobar: muestra resumen de la transferencia.
- Diálogo de rechazo: campo de motivo de rechazo.
- La aprobación actualiza el estatus de `PENDING` a `COMPLETED`.
- El rechazo actualiza el estatus a `REJECTED` con nota de motivo.
- Integración con `PATCH /api/v1/transfers/:id` (actualización de estatus).
- Solo visible para usuarios con permiso `finops:transfers:write`.

## Fuera de alcance
- Flujo de doble aprobación (requiere dos aprobadores) — Fase 15+.
- Notificación al creador de la transferencia — Fase 15+.

## Dependencias
- `T-1413`: detalle de transferencia como contexto de aprobación.
- `T-1322`: endpoint `PATCH /api/v1/transfers/:id` disponible.
- `T-1332`: permisos `finops:transfers:write` definidos.

## Criterios de aceptación
- [x] Botones de aprobación/rechazo visibles para usuarios autorizados.
- [x] Diálogo de confirmación de aprobación con resumen.
- [x] Campo de motivo en rechazo.
- [x] Estatus actualizado en lista tras aprobar/rechazar.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: flujo de aprobación demo funcional.

## Pruebas
- Usuario sin permiso `finops:transfers:write` — botones de aprobación no visibles.
- Aprobar transferencia pendiente — estatus cambia a COMPLETED.
- Rechazar con motivo — estatus cambia a REJECTED, motivo visible en detalle.

## Riesgos
- **Botones visibles pero deshabilitados vs. ocultos**: mostrar botones deshabilitados es más informativo para el usuario, pero ocultar los botones para usuarios sin permiso reduce confusión. Mitigación: ocultar completamente los botones sin permiso.

## Documentación a actualizar
- `apps/web/src/modules/finops/components/TransferApprovalActions.jsx` — componente nuevo.

## Decisiones clave
- **Verificación de permiso en frontend**: aunque el backend enforcea los permisos, la UI también verifica el permiso local para mostrar/ocultar los botones. Esto es UX, no seguridad.
- **Motivo de rechazo obligatorio**: el rechazo siempre requiere motivo para mantener trazabilidad.

## Evidencia documental
- `apps/web/src/modules/finops/components/TransferApprovalActions.jsx`

## Pendientes para la siguiente task
- `T-1413` implementa el detalle de transferencia con rastreo de doble partida.

## Pendientes no resueltos
- Ninguno.
