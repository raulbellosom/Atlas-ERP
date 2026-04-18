# T-1041 - Implementar pruebas E2E de sync online->offline->online

## Metadatos
- ID: `T-1041`
- Fase: `Fase 10`
- Bloque: `Bloque 9`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Cobertura de comportamiento del ciclo de sync desktop en transición de conectividad:

- Extracción de precondiciones de ejecución a helper puro (`evaluateSyncPreconditions`).
- Prueba del flujo online -> offline -> online.
- Prueba de bloqueo por sync en progreso.
- Helper de resumen de resultados de batch (`summarizeBatchResults`) para trazabilidad.

## Criterios de aceptación
- [x] Existe test automatizado del cambio de estado online/offline/online.
- [x] Existe test de bloqueo por `sync_in_progress`.
- [x] Existe test de resumen de resultados por batch.
- [x] Suite `@atlasrep/desktop test:sync-core` en verde.
