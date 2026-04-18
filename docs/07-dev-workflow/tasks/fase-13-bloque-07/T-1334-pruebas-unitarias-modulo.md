# T-1334 - Crear pruebas unitarias del módulo

## Metadatos
- ID: `T-1334`
- Fase: `Fase 13`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Agregar cobertura unitaria para las reglas de sincronización de Financial Operations Core, documentando la suite de pruebas que valida el registro de entidades financieras en el pipeline de sync.

## Alcance
- Suite unitaria nueva: `sync-finops-support.test.ts`.
- Casos cubiertos:
  - Las 6 entidades financieras están presentes en `ALLOWED_SYNC_ENTITIES`.
  - La estrategia de resolución es `none` para cada entidad financiera.
  - Cada entidad financiera está clasificada como `dangerous_merge`.
- Ejecución en pipeline de pruebas existente:
  - `pnpm --filter @atlasrep/api run test:sync-core`.

## Fuera de alcance
- Pruebas de integración del pipeline de sync completo (eso es T-1335).
- Pruebas de permisos (eso es T-1336).
- Pruebas E2E de movimientos en sync (Fase 15).

## Dependencias
- `T-1333`: `SyncService` y `SyncBatchItemDto` actualizados con entidades financieras.
- Script `test:sync-core` existente en `apps/api/package.json`.

## Criterios de aceptación
- [x] Se agregaron pruebas unitarias nuevas para reglas del módulo financiero en sync.
- [x] Las pruebas se ejecutan y pasan en la suite `test:sync-core`.
- [x] `test:sync-core` ✅ · `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run test:sync-core`: 11/11 en verde (incluyendo las nuevas).
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.

## Pruebas
- El archivo `sync-finops-support.test.ts` usa `node:test` nativo (ejecutado con `tsx --test`).
- Estructura de tests:
  - Grupo "ALLOWED_SYNC_ENTITIES": un test por entidad financiera.
  - Grupo "resolución de conflictos": un test por estrategia (`none`).
  - Grupo "clasificación de riesgo": un test por `dangerous_merge`.

## Riesgos
- **Runner de pruebas**: el proyecto usa `tsx --test` (node:test nativo), no Jest ni Vitest. Los tests deben usar la API de `node:test` (`test()`, `assert`).
- **Pruebas acopladas a implementación**: si los nombres de entidades cambian, las pruebas fallan. Esto es intencional — las pruebas actúan como contrato de la interfaz de sync.

## Documentación a actualizar
- `apps/api/src/modules/sync/sync-finops-support.test.ts` — archivo nuevo.
- `apps/api/package.json` — script `test:sync-core` ya existía; verificar que incluye el nuevo archivo.

## Decisiones clave
- **Tests como documentación ejecutable**: las pruebas unitarias de sync no solo verifican correctitud sino que documentan las entidades soportadas y sus estrategias. Son la fuente de verdad para desarrolladores del cliente desktop.
- **Suite separada de la de integración**: las pruebas de sync se mantienen en `test:sync-core` separadas de `test:finops-integration` (T-1335) para permitir ejecución independiente en CI.

## Evidencia documental
- `apps/api/src/modules/sync/sync-finops-support.test.ts`
- `apps/api/package.json` (script `test:sync-core`)

## Pendientes para la siguiente task
- `T-1335` (Bloque 8) crea las pruebas de integración del módulo completo.

## Pendientes no resueltos
- Ninguno.
