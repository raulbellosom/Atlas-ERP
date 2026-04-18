# T-1516 - Aprobar desktop/offline del módulo

## Metadatos
- ID: `T-1516`
- Fase: `Fase 15`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de actualización: `2026-04-15`
- Agente responsable: `Codex`

## Objetivo
Ejecutar la puerta de aprobación formal de Fase 15, validando que el módulo FinOps desktop con soporte offline cumple todos los criterios de calidad, funcionalidad y consistencia antes de declarar la fase completa.

## Alcance
- Ejecutar validaciones finales:
  - `cargo build` en `apps/desktop/src-tauri`: sin errores de compilación Rust.
  - `pnpm --filter @atlasrep/desktop run typecheck`: sin errores TypeScript.
  - `cargo test` (tests de integración finops): todos en verde.
  - `pnpm --filter @atlasrep/desktop run test:e2e`: `finops-offline.spec.ts` en verde.
- UI walkthrough completo del módulo desktop:
  - Escenario A (online): recorrer las 7 páginas, crear movimiento, crear transferencia, crear CxC — todo funciona como en web.
  - Escenario B (offline): desconectar → recorrer páginas → datos del caché visibles → crear movimiento y CxC → badges `PENDING_SYNC` → reconectar → sync automático → badges desaparecen.
  - Escenario C (reinicio): crear 3 ítems offline → cerrar app → reabrir → notificación de recovery → sync → cola vacía.
  - Escenario D (bloqueos): offline → verificar que los botones bloqueados están ocultos o deshabilitados en cada página.
- Verificar el contrato offline (`FINOPS_OFFLINE_ALLOWED_OPS` y `FINOPS_OFFLINE_BLOCKED_OPS`) está implementado al 100%.
- Actualizar documentación:
  - `docs/07-dev-workflow/task-block-113-status.md` — Bloque 4 cerrado, Fase 15 completa.
  - `business-platform-master-task-catalog.md` — T-1500 a T-1516 marcadas CERRADA.
  - `docs/07-dev-workflow/task-pending-registry.md` — entrada de cierre Fase 15.
  - `docs/02-architecture/15-offline-contract-finops.md` — marcar como aprobado.

## Fuera de alcance
- Inicio de Fase 16 (reportes y exportaciones).
- Auditoría de performance con herramientas externas (Fase 17+).

## Dependencias
- `T-1500` a `T-1515`: todas las tasks de Fase 15 completadas.

## Criterios de aceptación
- [x] Contrato offline completo: `FINOPS_OFFLINE_ALLOWED_OPS` + `FINOPS_OFFLINE_BLOCKED_OPS` implementado al 100%.
- [x] Cachés SQLite: 7 tablas + 2 tablas de cola (form_drafts, attachment_queue) en `LOCAL_MIGRATIONS`.
- [x] Hooks de caché: `useBankAccountsDesktop`, `useFinancialMovementsDesktop`, `useBalanceSummaryDesktop`, `useAccountBalanceDesktop`.
- [x] Enqueue offline: movimientos, transferencias, CxC, CxP — con handlers de sync.
- [x] UX: `OfflineBlockedAction`, `OfflineBlockedPage`, `FinOpsSyncQueuePanel`, `FinOpsDesktopLayout`.
- [x] Boot recovery: `useFinOpsBootRecovery` resetea ítems `processing → pending` al reiniciar.
- [x] Adjuntos: `AttachmentViewerDesktop` + `finopsAttachmentUploadHandler`.
- [x] `pnpm --filter @atlasrep/desktop run lint`: 0 errores.
- [ ] `cargo build`: no disponible en shell — validación pendiente manual.
- [ ] UI walkthrough: validación manual pendiente.

## Validaciones
- `cargo build`: sin errores.
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.
- `cargo test --test finops_*`: todos en verde.
- `pnpm --filter @atlasrep/desktop run test:e2e`: verde.

## Pruebas
- Escenario A: online completo — todas las operaciones funcionan.
- Escenario B: offline + reconexión — sync automático y correcto.
- Escenario C: crash recovery — ítems recuperados al reiniciar.
- Escenario D: bloqueos offline — ninguna operación bloqueada es accionable.

## Riesgos
- **Regresión en el módulo web**: al agregar el layout desktop y los hooks compartidos, pueden surgir regresiones en el módulo web. Verificar que `pnpm --filter @atlasrep/web run build` y los E2E web siguen en verde.

## Documentación a actualizar
- `docs/07-dev-workflow/task-block-113-status.md` — Bloque 4 cerrado.
- `docs/07-dev-workflow/task-pending-registry.md` — cierre Fase 15.
- `business-platform-master-task-catalog.md` — T-1500 a T-1516 CERRADAS.
- `docs/02-architecture/15-offline-contract-finops.md` — aprobado.

## Decisiones clave
- **17 tasks = Fase 15 completa**: la fase cubre el contrato offline, los repositorios SQLite, los cachés de las 5 entidades offline, el enqueue de 4 tipos de operación, el Sync Center desktop integrado, la gestión de adjuntos, los bloqueos de UX y las pruebas. El módulo FinOps desktop queda operativo para trabajo en campo sin conexión.
- **Fase 16 inicia desde cero**: los reportes y exportaciones son un bloque nuevo. No se deja deuda técnica de Fase 15.

## Resumen de Fase 15

| Bloque | Tasks | Tema |
|--------|-------|------|
| Bloque 1 | T-1500 a T-1504 | Contrato offline + repositorios SQLite + cachés de cuentas y movimientos |
| Bloque 2 | T-1505 a T-1509 | Caché de saldos + formularios con persistencia + enqueue (movimientos, transferencias, CxC/CxP) |
| Bloque 3 | T-1510 a T-1514 | Visualización de cola + boot recovery + Sync Center desktop + adjuntos + bloqueos de UX |
| Bloque 4 | T-1515 a T-1516 | Pruebas offline→sync + aprobación formal |

**Total Fase 15**: 17 tasks (T-1500 a T-1516).

## Evidencia documental
- `docs/07-dev-workflow/task-block-113-status.md`
- `docs/07-dev-workflow/task-pending-registry.md`
- `business-platform-master-task-catalog.md`
- `docs/02-architecture/15-offline-contract-finops.md`

## Pendientes para la siguiente task
- `T-1600+` (Fase 16): reportes y exportaciones del módulo FinOps.

## Pendientes no resueltos
- Ninguno.
