# T-1328 - Crear endpoint de conciliación

## Metadatos
- ID: `T-1328`
- Fase: `Fase 13`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Crear el endpoint operativo para ejecutar el proceso de conciliación de una sesión bancaria, comparando montos esperados vs. reales y marcando el estatus de cada partida.

## Alcance
- Endpoint agregado en `ReconciliationController`:
  - `POST /api/v1/reconciliation/sessions/:id/reconcile`
- DTO agregado:
  - `ReconcileSessionDto`: opcional `autoResolve: boolean` para marcar discrepancias menores como resueltas automáticamente.
- Método agregado en `ReconciliationService`:
  - `reconcileSession(sessionId: string, dto: ReconcileSessionDto)`.
- Lógica implementada:
  - Itera los ítems de la sesión.
  - Compara `expectedAmount` vs. `actualAmount` por ítem.
  - Marca cada ítem como `MATCHED`, `DISCREPANCY` o `RESOLVED` (si `autoResolve` activo).
  - Retorna métricas: `{ matched, discrepancy, resolved, pending }`.

## Fuera de alcance
- Conciliación automática con extracto bancario externo (Fase 14+).
- Cierre y aprobación de sesión (eso es T-1329).
- Auditoría de la operación de conciliación (eso es T-1331).

## Dependencias
- `T-1316`: `ReconciliationService` con `createSession` y `createItem` implementados.
- `T-1303`: servicio base con `findSessionById` y `findSessionItems` disponibles.

## Criterios de aceptación
- [x] Endpoint de conciliación ejecutable por sesión.
- [x] Métricas de resultado (`matched`, `discrepancy`, `resolved`, `pending`) retornadas.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- `POST /api/v1/reconciliation/sessions/:id/reconcile` con sesión existente y ítems → 200 con métricas.
- Con sesión cerrada → debe rechazar (400 o 422).
- Con `autoResolve: true` → partidas con diferencia dentro de tolerancia marcadas como `RESOLVED`.
- Con `autoResolve: false` → todas las discrepancias quedan como `DISCREPANCY`.

## Riesgos
- **Sesión ya reconciliada**: si se ejecuta `reconcile` dos veces, los ítems ya marcados se sobreescriben. Mitigación: el servicio verifica el estatus de la sesión antes de ejecutar.
- **Sesión sin ítems**: si la sesión no tiene ítems, las métricas son todas en cero. El endpoint debe retornar 200 con métricas vacías, no un error.
- **Tolerancia de reconciliación**: si `autoResolve` usa una tolerancia fija o configurable, debe documentarse. Mitigación: en v1, la tolerancia es 0 (exacto) excepto si `autoResolve` fuerza `RESOLVED`.

## Documentación a actualizar
- `apps/api/src/modules/reconciliation/reconciliation.controller.ts` — handler `reconcile` agregado.
- `apps/api/src/modules/reconciliation/reconciliation.service.ts` — método `reconcileSession` agregado.
- `apps/api/src/modules/reconciliation/dto/reconcile-session.dto.ts` — archivo nuevo.

## Decisiones clave
- **Reconciliación como operación idempotente-ish**: ejecutar `reconcile` varias veces sobre los mismos ítems actualiza su estatus basado en los montos actuales. No es destructiva pero sí sobreescribiente.
- **Métricas como respuesta del endpoint**: en lugar de retornar solo 200, el endpoint retorna métricas de resumen. Esto permite a la UI mostrar el resultado de la conciliación sin hacer una consulta adicional.

## Evidencia documental
- `apps/api/src/modules/reconciliation/reconciliation.controller.ts`
- `apps/api/src/modules/reconciliation/reconciliation.service.ts`
- `apps/api/src/modules/reconciliation/dto/reconcile-session.dto.ts`

## Pendientes para la siguiente task
- `T-1329` agrega los endpoints de cierre y aprobación de sesión de conciliación.

## Pendientes no resueltos
- Ninguno.
