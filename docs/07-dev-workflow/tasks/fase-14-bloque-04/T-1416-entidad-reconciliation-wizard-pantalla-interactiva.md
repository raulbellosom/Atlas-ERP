# T-1416 - Entidad Reconciliation: wizard / pantalla interactiva

## Metadatos
- ID: `T-1416`
- Fase: `Fase 14`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar el wizard interactivo de conciliación bancaria que permite ejecutar el proceso de comparación de partidas, marcar ítems manualmente y cerrar/aprobar la sesión desde una interfaz guiada.

## Alcance
- Crear página `ReconciliationWizardPage` en `/finops/reconciliation/:id`.
- Secciones del wizard:
  - Encabezado: nombre de sesión, cuenta, periodo, estatus.
  - Lista de ítems de conciliación: esperado vs. real, estatus por ítem (badge).
  - Botón "Ejecutar reconciliación" — llama a `POST /sessions/:id/reconcile`.
  - Métricas de resultado: matched, discrepancy, resolved, pending.
  - Botones "Cerrar sesión" y "Aprobar sesión" con confirmaciones.
- Integración con:
  - `GET /api/v1/reconciliation/sessions/:id`.
  - `GET /api/v1/reconciliation/sessions/:id/items`.
  - `POST /api/v1/reconciliation/sessions/:id/reconcile`.
  - `POST /api/v1/reconciliation/sessions/:id/close`.
  - `POST /api/v1/reconciliation/sessions/:id/approve`.

## Fuera de alcance
- Importación de extracto bancario desde archivo CSV/OFX (Fase 15+).
- Reconciliación automática con inteligencia (Fase 15+).

## Dependencias
- `T-1415`: listado de sesiones disponible.
- `T-1328`, `T-1329`: endpoints operativos de conciliación disponibles.

## Criterios de aceptación
- [x] Wizard de conciliación con lista de ítems interactiva.
- [x] Ejecución de reconciliación con métricas de resultado.
- [x] Cierre y aprobación de sesión funcionales.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: flujo completo de conciliación demo funcional.

## Pruebas
- Ejecutar reconciliación en sesión con ítems demo — métricas se muestran correctamente.
- Ítem MATCHED — badge verde.
- Ítem DISCREPANCY — badge rojo.
- Cerrar sesión con pendientes — muestra advertencia antes de confirmar.
- Aprobar sesión — estatus cambia a APPROVED.

## Riesgos
- **Lista de ítems larga**: si una sesión tiene muchos ítems (100+), la UI puede ser lenta. Mitigación: implementar virtualización de lista con `react-virtual` si es necesario.

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/ReconciliationWizardPage.jsx` — archivo nuevo.

## Decisiones clave
- **Wizard como vista completa (no modal)**: la conciliación es un proceso que puede tomar tiempo y requiere concentración. Se implementa como página completa, no como modal o drawer, para dar espacio al usuario.
- **Métricas post-reconciliación siempre visibles**: después de ejecutar la reconciliación, las métricas permanecen visibles hasta que el usuario cierra o aprueba la sesión.

## Evidencia documental
- `apps/web/src/modules/finops/pages/ReconciliationWizardPage.jsx`

## Pendientes para la siguiente task
- `T-1417` implementa el resumen global de balance snapshots.

## Pendientes no resueltos
- Ninguno.
