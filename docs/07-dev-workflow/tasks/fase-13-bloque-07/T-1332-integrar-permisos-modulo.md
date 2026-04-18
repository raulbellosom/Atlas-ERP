# T-1332 - Integrar permisos del módulo

## Metadatos
- ID: `T-1332`
- Fase: `Fase 13`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Aplicar control de acceso basado en permisos en todos los endpoints del módulo Financial Operations Core, definiendo los permisos necesarios y asignándolos a los roles operativos del sistema.

## Alcance
- Decoradores `@RequireAllPermissions(...)` agregados en los 7 controladores del módulo:
  - `BankAccountsController`
  - `FinancialMovementsController`
  - `TransfersController`
  - `ReceivablesLiteController`
  - `PayablesLiteController`
  - `BalanceSnapshotsController`
  - `ReconciliationController`
- Permisos definidos con patrón `finops:<entidad>:<acción>`:
  - `:read` para endpoints GET.
  - `:write` para endpoints POST, PATCH, DELETE.
  - `:reconcile`, `:close`, `:approve` para endpoints operativos de conciliación.
- Seed de permisos ampliado (`permissions.seed.ts`) con todas las llaves `finops:*`.
- Asignación de permisos a roles:
  - `tesorero`: `finops:*:read` + `finops:*:write` + `finops:*:reconcile` + `finops:*:close`.
  - `auditor`: solo `finops:*:read`.

## Fuera de alcance
- Implementación del guard de permisos (ya existe en el sistema — esta task solo aplica los decoradores).
- Permisos de administración de roles (eso es el módulo de IAM existente).
- Permisos por sucursal o segmentación avanzada (Fase 14+).

## Dependencias
- `T-1320` a `T-1329`: todos los endpoints del módulo implementados.
- `@RequireAllPermissions` guard y decorador existentes en el backend.
- `permissions.seed.ts` existente.

## Criterios de aceptación
- [x] Endpoints del módulo protegidos por permisos explícitos.
- [x] Se definieron permisos de lectura/escritura para entidades financieras.
- [x] Los permisos fueron incorporados al seed oficial.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.

## Pruebas
- Sin token → endpoints retornan 401.
- Con token de `auditor` → endpoints GET retornan 200, endpoints POST retornan 403.
- Con token de `tesorero` → todos los endpoints del módulo accesibles.
- Ejecutar `db:seed` → permisos `finops:*` aparecen en la BD.

## Riesgos
- **Permiso sin rol asignado**: si los permisos se crean en el seed pero no se asignan a ningún rol, ningún usuario podrá acceder al módulo. Mitigación: verificar en pruebas que los roles `tesorero` y `auditor` tienen los permisos correspondientes.
- **Guard no activado globalmente**: si el guard `RequireAllPermissions` no está activo como global guard, los decoradores no tienen efecto. Mitigación: verificar que `AppModule` registra el guard globalmente.

## Documentación a actualizar
- Los 7 controladores del módulo (permisos por handler).
- `apps/api/prisma/seeds/permissions.seed.ts` — permisos `finops:*` agregados.

## Decisiones clave
- **Patrón de permiso `finops:<entidad>:<acción>`**: consistente con el patrón de permisos del resto del sistema. Facilita la búsqueda y gestión de permisos desde el panel de administración.
- **Dos roles operativos base**: `tesorero` (lectura + escritura) y `auditor` (solo lectura). Roles adicionales (como `gerente_finanzas` con aprobación) se agregan en Fase 14 cuando el flujo de aprobación esté definido.

## Evidencia documental
- `apps/api/src/modules/bank-accounts/bank-accounts.controller.ts`
- `apps/api/src/modules/financial-movements/financial-movements.controller.ts`
- `apps/api/src/modules/transfers/transfers.controller.ts`
- `apps/api/src/modules/receivables-lite/receivables-lite.controller.ts`
- `apps/api/src/modules/payables-lite/payables-lite.controller.ts`
- `apps/api/src/modules/balance-snapshots/balance-snapshots.controller.ts`
- `apps/api/src/modules/reconciliation/reconciliation.controller.ts`
- `apps/api/prisma/seeds/permissions.seed.ts`

## Pendientes para la siguiente task
- `T-1333` habilita las entidades financieras en el pipeline de sincronización.

## Pendientes no resueltos
- Ninguno.
