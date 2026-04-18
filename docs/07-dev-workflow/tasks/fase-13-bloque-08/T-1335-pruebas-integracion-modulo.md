# T-1335 - Crear pruebas de integración del módulo Financial Operations

## Metadatos
- ID: `T-1335`
- Fase: `Fase 13`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Crear pruebas de integración que validen la estructura y completitud de los servicios y controladores del módulo Financial Operations Core, asegurando que la capa de API está correctamente implementada antes del cierre formal de Fase 13.

## Alcance
- Suite de integración: `finops-integration.test.ts` (21 tests).
- Valida que los 7 servicios financieros exportan todos los métodos esperados:
  - `BankAccountsService`, `FinancialMovementsService`, `TransfersService`, `ReconciliationService`, `BalanceSnapshotsService`, `ReceivablesLiteService`, `PayablesLiteService`.
- Valida que los 7 controladores exponen todos los handlers esperados.
- Tests de conteo mínimo de métodos (≥3 por servicio, ≥2 por controller).
- Agrega script `test:finops-integration` a `apps/api/package.json`.

## Fuera de alcance
- Pruebas E2E contra base de datos real (requiere servidor activo y seed).
- Pruebas de flujo HTTP con servidor activo.
- Pruebas de permisos (eso es T-1336).

## Dependencias
- `T-1300` a `T-1334` — todos los servicios y controladores del módulo implementados.

## Criterios de aceptación
- [x] 7 servicios validados con métodos esperados.
- [x] 7 controladores validados con handlers exactos.
- [x] Tests de conteo mínimo de métodos/handlers.
- [x] Script `test:finops-integration` operativo.
- [x] 21/21 pruebas pasan en verde.

## Validaciones
- `pnpm --filter @atlasrep/api run test:finops-integration` ✅ (21/21).
- `pnpm --filter @atlasrep/api run typecheck` ✅.
- `pnpm --filter @atlasrep/api run lint` ✅.

## Pruebas
- Archivo: `apps/api/src/modules/financial-movements/finops-integration.test.ts`.
- Runner: `tsx --test` (node:test nativo).
- Total: 21 tests distribuidos en grupos por servicio/controller.
- Estrategia: reflexión de clases (verificación de métodos en el prototipo) sin instanciar ni conectar a DB.

## Riesgos
- **Tests acoplados a nombres de métodos**: si un método se renombra, el test falla inmediatamente. Esto es intencional — actúa como contrato de la API interna.
- **Falso positivo si el método existe pero no funciona**: los tests de integración de esta task solo verifican que el método existe, no que funciona correctamente. Las pruebas E2E (Fase 14) verificarán el comportamiento.

## Documentación a actualizar
- `apps/api/src/modules/financial-movements/finops-integration.test.ts` — archivo nuevo.
- `apps/api/package.json` — script `test:finops-integration` agregado.

## Decisiones clave
- **Reflexión de clases sin instanciar**: en lugar de crear instancias con mocks del servicio Prisma, los tests usan reflexión (`Object.getOwnPropertyNames(Service.prototype)`) para verificar la existencia de métodos. Esto es más rápido y evita la complejidad de configuración de mocks.
- **Pruebas agrupadas por entidad**: cada servicio/controller tiene su grupo de tests, facilitando el diagnóstico cuando falla un grupo específico.

## Evidencia documental
- `apps/api/src/modules/financial-movements/finops-integration.test.ts`
- `apps/api/package.json` (script `test:finops-integration`)

## Pendientes para la siguiente task
- `T-1336` crea las pruebas de permisos del módulo.

## Pendientes no resueltos
- Ninguno.
