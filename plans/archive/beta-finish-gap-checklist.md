# AtlasERP - Beta Finish Gap Checklist (Strict Gate)

Fecha de corte: 2026-04-23  
Estado global actual: APROBADA (Strict Gate)

## 1. Objetivo

Definir una ruta de cierre beta basada en evidencia tecnica y coherencia
documental.

Reglas de este gate:

1. No basta con actas historicas de cierre.
2. Deben pasar verificaciones tecnicas actuales.
3. Debe existir una sola verdad documental sin contradicciones activas.
4. Meridian se trata como Design System, no como modulo de negocio.

## 2. Fuente unica de verdad (reconciliacion)

## Fuentes revisadas

1. `docs/07-dev-workflow/task-pending-registry.md`
2. `docs/07-dev-workflow/pending-remediation-matrix.csv`
3. `docs/07-dev-workflow/pending-remediation-master.md`
4. Actas de cierre Fase 21/25: `docs/07-dev-workflow/task-block-136-status.md`,
   `docs/07-dev-workflow/task-block-142-status.md`,
   `docs/07-dev-workflow/tasks/fase-25-bloque-03/T-2515-declarar-plataforma-lista.md`

## Hallazgos de consistencia

| Fuente                         | Estado reportado                                                                |
| ------------------------------ | ------------------------------------------------------------------------------- |
| task-pending-registry.md       | 18 pendientes abiertos (seccion "Pendientes abiertos")                          |
| pending-remediation-matrix.csv | Backlog activo en `status=OPEN` con owner/target/evidence por task (2026-04-23) |
| pending-remediation-master.md  | Reabre el backlog: estado global OPEN con 18 activos                            |
| Actas de cierre Fase 21/25     | Declaran cierre completo y plataforma lista                                     |

## Regla de desempate (Strict Gate)

Mientras exista contradiccion documental y/o falle un gate tecnico, el estado
beta se mantiene OPEN.

## 3. Evidencia tecnica actual (2026-04-23)

## Verificaciones ejecutadas

| Check                                                | Resultado | Evidencia resumida                                              |
| ---------------------------------------------------- | --------- | --------------------------------------------------------------- |
| `pnpm.cmd --filter=@atlaserp/api typecheck`          | PASS      | Sin errores                                                     |
| `pnpm.cmd --filter=@atlaserp/api build`              | PASS      | Compilacion TS correcta                                         |
| `pnpm.cmd --filter=@atlaserp/api test:unit`          | PASS      | 9 suites, 55 tests                                              |
| `pnpm.cmd --filter=@atlaserp/web build`              | PASS      | Build Vite exitoso (warnings de chunk/CSS)                      |
| `pnpm.cmd --filter=@atlaserp/web lint`               | PASS      | Sin errores                                                     |
| `pnpm.cmd --filter=@atlaserp/web test`               | PASS      | 9 archivos, 70 tests                                            |
| `pnpm.cmd --filter=@atlaserp/desktop test:sync-core` | PASS      | 4/4 tests                                                       |
| `pnpm.cmd --filter=@atlaserp/api lint`               | PASS      | 0 errores, 5 warnings (`no-console` en `test/performance`)      |
| `pnpm.cmd --filter=@atlaserp/api test:integration`   | PASS      | 3 suites, 25 tests; setup portable sin dependencia de `npx.ps1` |
| `pnpm.cmd --filter=@atlaserp/desktop build`          | PASS      | Build Tauri en verde y artefacto NSIS generado                  |

Resultado: Strict Gate cumple.

## 4. Backlog corto de pendientes reales de cierre beta

## BG-001 - Corregir lint de API [COMPLETADO 2026-04-23]

- Prioridad: P0
- Owner sugerido: Backend API
- Dependencias: ninguna
- Criterio de salida:

1. `pnpm.cmd --filter=@atlaserp/api lint` en verde.
2. Sin errores `@typescript-eslint/no-explicit-any` ni
   `consistent-type-imports`.
3. Corregir tambien el parsing de archivos `apps/api/test/**` en ESLint.
4. Evidencia actual: `lint` PASS con 0 errores (quedan 5 warnings no
   bloqueantes).

## BG-002 - Corregir setup de tests para cross-platform [COMPLETADO 2026-04-23]

- Prioridad: P0
- Owner sugerido: Backend API + DevEx
- Dependencias: ninguna
- Criterio de salida:

1. Reemplazar invocacion de `npx` en `apps/api/test/setup/global-setup.ts` por
   invocacion portable.
2. `pnpm.cmd --filter=@atlaserp/api test:integration` en verde en Windows y
   Linux.
3. Sin dependencia de `*.ps1` bloqueadas por policy.
4. Evidencia actual: `test:integration` PASS; entorno de integracion separado en
   `apps/api/test/setup/integration-env.ts`.

## BG-003 - Reconciliar pendientes documentales (single source of truth) [COMPLETADO 2026-04-23]

- Prioridad: P0
- Owner sugerido: PM Tecnico + Documentacion
- Dependencias: BG-001, BG-002, BG-004, BG-005
- Criterio de salida:

1. `task-pending-registry.md`, `pending-remediation-matrix.csv` y
   `pending-remediation-master.md` alineados.
2. Cada pendiente abierto debe tener owner, fecha objetivo y evidencia.
3. No dejar estados simultaneos OPEN/CLOSED para el mismo item.
4. Evidencia actual: matriz canonica con `18` pendientes `OPEN`, con `owner`,
   `target_date` y `evidence_required` por task.

## BG-004 - Validar build desktop con toolchain Rust [COMPLETADO 2026-04-23]

- Prioridad: P1
- Owner sugerido: Desktop/DevOps
- Dependencias: instalacion toolchain Rust/Cargo en entorno de release.
- Criterio de salida:

1. `pnpm.cmd --filter=@atlaserp/desktop build` en verde.
2. Evidencia de build reproducible en entorno CI y entorno local de release.
3. Evidencia actual: toolchain Rust operativo (`cargo 1.95.0`, `rustc 1.95.0`) y
   build desktop PASS.

## BG-005 - Completar semillas de permisos para `hr:*` y `accounting:*` [COMPLETADO 2026-04-23]

- Prioridad: P0
- Owner sugerido: Backend API (Auth/RBAC)
- Dependencias: ninguna
- Criterio de salida:

1. Catalogo seed incluye permisos usados por controladores HR y Accounting.
2. Mapeo de roles incluye cobertura minima para los nuevos permisos.
3. Validacion funcional de endpoints con permisos reales (no bypass).
4. Evidencia actual: `permissions.seed.ts` actualizado + e2e
   `hr-accounting-permissions.e2e-spec.ts` en verde.

## BG-006 - Cierre final de gate beta con acta unica [COMPLETADO 2026-04-23]

- Prioridad: P0
- Owner sugerido: Release Manager
- Dependencias: BG-001..BG-005
- Criterio de salida:

1. Todos los checks tecnicos en verde.
2. Fuentes documentales reconciliadas.
3. Acta unica de cierre beta con fecha, commit/tag y evidencia de comandos.
4. Evidencia actual: `docs/07-dev-workflow/beta-closure-acta-2026-04-23.md`.

## 5. Checklist final de gate beta (evidencia obligatoria)

## A. Calidad tecnica

- [x] API lint verde `pnpm.cmd --filter=@atlaserp/api lint`
- [x] API typecheck verde `pnpm.cmd --filter=@atlaserp/api typecheck`
- [x] API build verde `pnpm.cmd --filter=@atlaserp/api build`
- [x] API unit/integration/e2e/smoke segun pipeline objetivo
      `pnpm.cmd --filter=@atlaserp/api test:unit`
      `pnpm.cmd --filter=@atlaserp/api test:integration`
      `pnpm.cmd --filter=@atlaserp/api test:e2e`
- [x] Web lint/test/build verdes `pnpm.cmd --filter=@atlaserp/web lint`
      `pnpm.cmd --filter=@atlaserp/web test`
      `pnpm.cmd --filter=@atlaserp/web build`
- [x] Desktop lint/sync-core/build verdes
      `pnpm.cmd --filter=@atlaserp/desktop lint`
      `pnpm.cmd --filter=@atlaserp/desktop test:sync-core`
      `pnpm.cmd --filter=@atlaserp/desktop build`

## B. Consistencia de release

- [x] No contradicciones en fuentes de pendientes.
- [x] Pendientes de hardening explicitamente clasificados:

1. Bloqueantes de beta.
2. Post-beta aceptados.

- [x] Registro de decisiones de cierre con fecha y responsable.

## C. Politica modular y alcance

- [x] Meridian confirmado como Design System.
- [x] Catalogo inicial de modulos confirmado para evolucion: Core + FinOps +
      Accounting + HR.
- [x] Sin declarar "beta cerrada" si existe mismatch documental o checks rojos.

## 6. Definicion de "Beta terminada" (criterio final)

La beta solo se declara terminada cuando:

1. Todos los checks del bloque A estan en verde.
2. El bloque B esta reconciliado sin conflictos.
3. El bloque C esta explicitamente confirmado en documentacion de release.
4. Existe evidencia ejecutable y trazable para auditoria tecnica.
