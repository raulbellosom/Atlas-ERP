# T-1501 - Definir qué operaciones del módulo NO se permiten offline

## Metadatos
- ID: `T-1501`
- Fase: `Fase 15`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Documentar y codificar las operaciones del módulo FinOps que quedan bloqueadas en modo offline, definiendo el mensaje de UX que recibe el usuario y la lógica de detección de incompatibilidad para cada caso.

## Alcance
- Para cada operación no permitida, definir:
  - Por qué técnicamente no es posible offline.
  - Qué ve el usuario (mensaje, botón deshabilitado o página de bloqueo).
  - Si existe una alternativa offline parcial.
- Operaciones bloqueadas y su justificación:

| Operación | Razón de bloqueo | UX |
|-----------|-----------------|-----|
| Crear cuenta bancaria | Requiere validación de cuenta única por organización en el servidor | Botón deshabilitado + tooltip |
| Editar cualquier registro | Riesgo de conflicto — se desconoce estado actual del servidor | Botón oculto en modo offline |
| Eliminar (soft-delete) | Riesgo de inconsistencia si el registro fue modificado online | Botón oculto en modo offline |
| Reconciliación (sesión o wizard) | Requiere comparar partidas del servidor en tiempo real | Página bloqueada con mensaje |
| Aprobación de transferencias | Requiere flujo de autorización multi-actor con estado del servidor | Botón deshabilitado + tooltip |
| Registro de balance snapshot | Representa un corte contable oficial — solo en online | Botón deshabilitado |
| KPI "Vencidas" (CxC/CxP) | Endpoint de conteo en servidor — no hay equivalente local | Muestra "N/D" con indicador offline |

- Definir `FINOPS_OFFLINE_BLOCKED_OPS` como complemento de `FINOPS_OFFLINE_ALLOWED_OPS`.
- Definir el componente `OfflineBlockedAction` que unifica el patrón de UX de bloqueo.

## Fuera de alcance
- Implementación del componente `OfflineBlockedAction` (se implementa en T-1514).
- Operaciones permitidas (T-1500).

## Dependencias
- `T-1500`: contrato de operaciones permitidas definido — esta task lo complementa.
- `T-1420`: `useNetworkStatus` hook ya implementado en el módulo web — se reutiliza en desktop.

## Criterios de aceptación
- [x] Tabla de operaciones bloqueadas completa en `docs/02-architecture/15-offline-contract-finops.md` (ampliación de T-1500).
- [x] Constante `FINOPS_OFFLINE_BLOCKED_OPS` definida en `apps/desktop/src/modules/finops/offline-contract.js`.
- [x] Patrón de UX de bloqueo documentado (tooltip, ocultar vs deshabilitar).

## Validaciones
- Revisión manual: cada operación de escritura del módulo tiene una decisión explícita (permitida o bloqueada).
- `pnpm --filter @atlasrep/desktop run typecheck`: sin errores.

## Pruebas
- No aplica prueba automatizada — es un documento de decisión.
- Revisión: ¿queda alguna operación de escritura sin clasificar? → La respuesta debe ser no.

## Riesgos
- **Granularidad excesiva**: intentar clasificar cada variante de operación puede generar un documento inutilizable. Se agrupan por entidad y tipo de acción (CRUD), no por endpoint específico.

## Documentación a actualizar
- `docs/02-architecture/15-offline-contract-finops.md` — ampliación de la sección "Operaciones NO permitidas".
- `apps/desktop/src/modules/finops/offline-contract.ts` — constante `FINOPS_OFFLINE_BLOCKED_OPS`.

## Decisiones clave
- **Ocultar vs deshabilitar**: los botones que implican escritura se **ocultan** completamente en modo offline (no deshabilitados). Excepción: si la operación tiene un equivalente parcial disponible offline, se deshabilita con tooltip explicativo. La regla: si no hay nada que el usuario pueda hacer, ocultarlo evita frustración.
- **"N/D" para métricas no disponibles**: el KPI de vencidas y el resumen de saldos muestran "N/D" con un indicador de offline en lugar de un error, para no alarmar al usuario — simplemente no está disponible sin conexión.

## Evidencia documental
- `docs/02-architecture/15-offline-contract-finops.md` (sección extendida)
- `apps/desktop/src/modules/finops/offline-contract.ts`

## Pendientes para la siguiente task
- `T-1502` implementa los repositorios SQLite que materializan el contrato definido en T-1500 y T-1501.

## Pendientes no resueltos
- Ninguno.
