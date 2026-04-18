# T-1329 - Crear endpoint de cierre/aprobación de conciliación

## Metadatos
- ID: `T-1329`
- Fase: `Fase 13`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Exponer los endpoints para el cierre normal y la aprobación forzada de sesiones de conciliación bancaria, completando el flujo operativo del módulo de conciliación.

## Alcance
- Endpoints agregados en `ReconciliationController`:
  - `POST /api/v1/reconciliation/sessions/:id/close` — cierre normal.
  - `POST /api/v1/reconciliation/sessions/:id/approve` — aprobación (cierre forzado).
- DTO agregado:
  - `CloseReconciliationSessionDto`: campo opcional `force: boolean` y `notes: string`.
- Método agregado en `ReconciliationService`:
  - `closeSession(sessionId: string, dto: CloseReconciliationSessionDto)`.
- Reglas implementadas:
  - Cierre normal (`force: false`): rechaza si hay partidas `PENDING` o `DISCREPANCY`.
  - Aprobación (`approve` endpoint): llama a `closeSession` con `force: true`.
  - Retorna métricas de estados de partidas al momento del cierre.

## Fuera de alcance
- Re-apertura de sesiones cerradas (Fase 14+).
- Notificaciones al cerrar sesión (Fase 14+).
- Auditoría de cierre (eso es T-1331).

## Dependencias
- `T-1328`: `reconcileSession` implementado — el cierre usualmente se ejecuta tras la conciliación.
- `T-1316`: `ReconciliationService` base disponible.

## Criterios de aceptación
- [x] Endpoint de cierre operativo implementado.
- [x] Endpoint de aprobación implementado para flujo forzado.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `POST /api/v1/reconciliation/sessions/:id/close` con partidas `PENDING` → 422 (o 400).
- `POST /api/v1/reconciliation/sessions/:id/close` sin partidas pendientes → 200 con métricas.
- `POST /api/v1/reconciliation/sessions/:id/approve` con partidas `DISCREPANCY` → 200 (fuerza cierre).
- `POST /api/v1/reconciliation/sessions/:id/close` en sesión ya cerrada → 400.

## Riesgos
- **Doble cierre**: si se intenta cerrar una sesión ya cerrada, el servicio debe rechazarlo con error 400. Mitigación: verificar `session.status !== 'CLOSED'` antes de proceder.
- **Aprobación sin reconciliar**: si se aprueba una sesión sin haber ejecutado `reconcile`, todos los ítems quedan `PENDING` y el cierre forzado los deja sin resolución. Mitigación: documentar el flujo recomendado: reconcile → close/approve.

## Documentación a actualizar
- `apps/api/src/modules/reconciliation/reconciliation.controller.ts` — handlers `close` y `approve` agregados.
- `apps/api/src/modules/reconciliation/reconciliation.service.ts` — método `closeSession` agregado.
- `apps/api/src/modules/reconciliation/dto/close-reconciliation-session.dto.ts` — archivo nuevo.

## Decisiones clave
- **Dos endpoints en lugar de uno con `force`**: `/close` y `/approve` son semánticamente distintos desde la perspectiva del negocio. Un tesorero puede cerrar; un gerente puede aprobar. Esta separación facilita la asignación de permisos diferenciados en T-1332.
- **`closeSession` con `force` como implementación unificada**: internamente, `/approve` llama a `closeSession` con `force: true`. Esto evita duplicar lógica y centraliza las reglas de cierre en un solo método del servicio.

## Evidencia documental
- `apps/api/src/modules/reconciliation/reconciliation.controller.ts`
- `apps/api/src/modules/reconciliation/reconciliation.service.ts`
- `apps/api/src/modules/reconciliation/dto/close-reconciliation-session.dto.ts`

## Pendientes para la siguiente task
- `T-1330` (Bloque 7) integra uploads de comprobantes a movimientos financieros.

## Pendientes no resueltos
- Ninguno.
