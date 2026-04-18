# T-1515 - Crear pruebas offline->sync del módulo

## Metadatos
- ID: `T-1515`
- Fase: `Fase 15`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar las pruebas de integración del flujo offline → sincronización del módulo FinOps en la aplicación desktop Tauri, verificando que las operaciones encoladas se procesan correctamente al reconectar y que el estado final del sistema es consistente.

## Alcance
- Crear suite de pruebas de integración en `apps/desktop/src-tauri/tests/finops/`:
  - `offline_movement_sync.rs` — flujo completo: crear movimiento offline → verificar cola → simular reconexión → verificar sync → verificar caché actualizado.
  - `offline_transfer_sync.rs` — igual para transferencias.
  - `offline_cxc_cxp_sync.rs` — igual para CxC y CxP.
  - `offline_attachment_sync.rs` — adjunto guardado localmente → upload a MinIO → caché actualizado.
  - `boot_recovery.rs` — simular cierre abrupto con items `SYNCING` → reinicio → items reseteados a `PENDING`.
- Pruebas E2E con Playwright en `apps/desktop/e2e/`:
  - `finops-offline.spec.ts` — con red deshabilitada (Playwright network interception): crear movimiento → verificar en lista con badge → habilitar red → verificar sync → verificar badge desaparece.
- Prueba de carga: 100 items en cola → sync completo en menos de 60s.

## Fuera de alcance
- Pruebas de conflictos de merge (Fase 17+).
- Pruebas de concurrencia multi-dispositivo (Fase 17+).
- Pruebas de rendimiento de caché con > 10,000 registros (Fase 17+).

## Dependencias
- `T-1507` a `T-1514`: toda la lógica offline implementada.
- `T-1425`: setup de Playwright en el workspace web — el setup desktop replica el mismo patrón.
- `T-1335` a `T-1336`: patrón de pruebas de integración de Fase 13 como referencia.

## Criterios de aceptación
- [ ] Suite de 5 tests de integración Rust pasando (`cargo test` en `apps/desktop/src-tauri`).
- [ ] `finops-offline.spec.ts` Playwright pasando.
- [ ] Prueba de carga: 100 items synced en < 60s.
- [ ] `pnpm --filter @atlasrep/desktop run typecheck`: sin errores en archivos de test.

## Validaciones
- `cargo test --test offline_movement_sync`: test pasa.
- `cargo test --test boot_recovery`: test pasa.
- `pnpm --filter @atlasrep/desktop run test:e2e`: `finops-offline.spec.ts` en verde.

## Pruebas
- Flujo completo movimiento: offline create → queue (1 item) → reconnect → queue (0 items) → caché con id real.
- Flujo adjunto: offline attach → local file exists → reconnect + movement synced → file uploaded to MinIO → local file deleted.
- Boot recovery: 3 items `SYNCING` → cierre → reinicio → 3 items `PENDING`.
- Carga: 100 items de tipos mixtos (movimientos, CxC, CxP) → sync en < 60s.

## Riesgos
- **Dependencia de backend real en tests de integración Rust**: los tests de integración necesitan un backend activo. Mitigación: usar un backend de test con base de datos PostgreSQL dedicada en CI, similar al entorno de Fase 13.
- **Flakiness en tests de Playwright con network interception**: interceptar la red con Playwright en una app Tauri requiere interceptar las llamadas al nivel del webview. Mitigación: usar `page.route()` de Playwright que funciona para el WebView de Tauri.

## Documentación a actualizar
- `apps/desktop/src-tauri/tests/finops/offline_movement_sync.rs` — archivo nuevo.
- `apps/desktop/src-tauri/tests/finops/offline_transfer_sync.rs` — archivo nuevo.
- `apps/desktop/src-tauri/tests/finops/offline_cxc_cxp_sync.rs` — archivo nuevo.
- `apps/desktop/src-tauri/tests/finops/offline_attachment_sync.rs` — archivo nuevo.
- `apps/desktop/src-tauri/tests/finops/boot_recovery.rs` — archivo nuevo.
- `apps/desktop/e2e/finops-offline.spec.ts` — archivo nuevo.

## Decisiones clave
- **Tests de integración en Rust, E2E en Playwright**: los tests Rust verifican la lógica de cola y sync a nivel de repositorio (sin UI). Playwright verifica el flujo completo incluyendo la UI. La combinación da cobertura completa sin duplicar esfuerzo.
- **Prueba de carga con 100 items**: 100 items es un escenario realista para un usuario de campo que trabaja un día completo sin conexión. 60s de sync es el límite aceptable de UX.

## Evidencia documental
- `apps/desktop/src-tauri/tests/finops/` (5 archivos de test)
- `apps/desktop/e2e/finops-offline.spec.ts`

## Pendientes para la siguiente task
- `T-1516` es la puerta de aprobación formal de Fase 15.

## Pendientes no resueltos
- Ninguno.
