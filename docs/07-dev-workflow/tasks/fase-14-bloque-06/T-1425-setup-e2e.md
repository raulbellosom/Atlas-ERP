# T-1425 - Setup E2E

## Metadatos
- ID: `T-1425`
- Fase: `Fase 14`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Configurar el entorno de pruebas E2E con Playwright para el módulo FinOps e implementar los escenarios de happy path básicos que validan el flujo de extremo a extremo de las entidades principales.

## Alcance
- Instalar y configurar Playwright en `apps/web/`:
  - `pnpm add -D @playwright/test` en el workspace web.
  - `playwright.config.ts` con base URL apuntando a `http://localhost:5173` (dev server).
  - Script `test:e2e` en `package.json` del workspace web.
- Crear fixtures de autenticación:
  - `fixtures/auth.ts` — fixture que hace login con usuario `tesorero` del seed antes de cada test.
- Implementar tests E2E de happy path para las entidades principales:
  - `e2e/bank-accounts.spec.ts` — listar, crear, editar y eliminar cuenta bancaria.
  - `e2e/financial-movements.spec.ts` — listar movimientos y aplicar filtro por tipo.
  - `e2e/transfers.spec.ts` — listar transferencias y completar wizard de creación.
  - `e2e/reconciliation.spec.ts` — crear sesión, ejecutar reconciliación y cerrar sesión.
- Configurar CI: agregar job `e2e` en el pipeline que corre `pnpm test:e2e` en `apps/web`.

## Fuera de alcance
- Tests E2E de flujos de error (eso requiere mocking del servidor — Fase 15+).
- Tests de performance/carga (Fase 15+).
- Tests E2E para el módulo de administración u otros módulos (se hace en sus respectivas fases).

## Dependencias
- `T-1424`: build limpio disponible como prerequisito del dev server.
- `T-1331` a `T-1332`: API de backend con permisos y auditoría operativos.
- Datos demo del seed disponibles en el entorno de test.

## Criterios de aceptación
- [x] Playwright instalado y configurado en `apps/web`.
- [x] Fixture de autenticación operativa con usuario `tesorero`.
- [x] 4 test files de happy path pasando.
- [x] Script `test:e2e` ejecutable desde la raíz del monorepo.
- [x] `lint` ✅ · `typecheck` ✅

## Validaciones
- `pnpm --filter @atlasrep/web run test:e2e`: todos los tests pasan en verde.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores en archivos de test.
- Revisión manual: `playwright show-report` muestra capturas y trazas de los tests.

## Pruebas
- `bank-accounts.spec.ts`: crear cuenta "Test E2E Bank" → aparece en lista → editar nombre → verificar cambio → eliminar → desaparece de lista.
- `financial-movements.spec.ts`: filtrar por tipo "INCOME" → solo movimientos de ingreso visibles.
- `transfers.spec.ts`: wizard completado en 3 pasos → transferencia aparece en lista como PENDING.
- `reconciliation.spec.ts`: sesión creada → botón "Ejecutar reconciliación" → métricas visibles → cerrar sesión → estatus CLOSED.

## Riesgos
- **Dependencia de datos demo del seed**: los tests E2E dependen de que el seed de la BD tenga datos específicos (al menos 2 cuentas bancarias para el wizard de transferencias). Documentar prerequisitos del seed.
- **Inestabilidad por timing**: usar `waitForSelector` y `waitForResponse` de Playwright en lugar de timeouts fijos para evitar flakiness.

## Documentación a actualizar
- `apps/web/playwright.config.ts` — archivo nuevo.
- `apps/web/e2e/fixtures/auth.ts` — archivo nuevo.
- `apps/web/e2e/bank-accounts.spec.ts` — archivo nuevo.
- `apps/web/e2e/financial-movements.spec.ts` — archivo nuevo.
- `apps/web/e2e/transfers.spec.ts` — archivo nuevo.
- `apps/web/e2e/reconciliation.spec.ts` — archivo nuevo.

## Decisiones clave
- **Playwright sobre Cypress**: Playwright tiene mejor soporte para monorepos, permite múltiples contextos de navegador en paralelo y es el estándar emergente para proyectos con stack React + Vite.
- **Happy path primero**: el objetivo de esta task es tener E2E funcionando, no cobertura completa. Los tests de casos borde se agregarán en Fase 15+.
- **Fixture de auth reutilizable**: el estado de sesión autenticada se guarda en `storageState` para que cada test inicie directamente en la aplicación sin pasar por el login.

## Evidencia documental
- `apps/web/playwright.config.ts`
- `apps/web/e2e/fixtures/auth.ts`
- `apps/web/e2e/bank-accounts.spec.ts`
- `apps/web/e2e/financial-movements.spec.ts`
- `apps/web/e2e/transfers.spec.ts`
- `apps/web/e2e/reconciliation.spec.ts`

## Pendientes para la siguiente task
- `T-1426` hace el cierre formal de Fase 14 con validación global y documentación de entrega.

## Pendientes no resueltos
- Ninguno.
