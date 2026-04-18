# T-1300 - Crear módulo backend BankAccounts

## Metadatos
- ID: `T-1300`
- Fase: `Fase 13`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Configurar el módulo backend `BankAccounts` en NestJS para exponer consultas base del dominio de cuentas bancarias. Este módulo es el punto de entrada de la capa de API del módulo Financial Operations Core.

## Alcance
- Crear `BankAccountsModule`, `BankAccountsController`, `BankAccountsService`.
- Crear `ListBankAccountsQueryDto` con filtros de organización, sucursal y tipo de cuenta.
- Exponer rutas:
  - `GET /api/v1/bank-accounts`
  - `GET /api/v1/bank-accounts/:id`
  - `GET /api/v1/bank-accounts/organization/:organizationId/active-count`
- Integrar módulo en `AppModule`.
- Implementar consultas base con Prisma (findAll con filtros, findOneById, countActiveByOrganization).

## Fuera de alcance
- Endpoints de creación, actualización y eliminación (eso es T-1313 y T-1320).
- Endpoints de balance y resumen de saldos (eso es T-1325 y T-1327).
- DTOs de escritura (eso es T-1307).
- Permisos y auditoría (eso es T-1331 y T-1332).

## Dependencias
- `T-1200` a `T-1222` (Fase 12): modelos Prisma y migraciones deben estar aplicados.
- `AppModule` existente en `apps/api/src/app.module.ts`.

## Criterios de aceptación
- [x] Módulo backend `bank-accounts` creado e integrado en `AppModule`.
- [x] Consultas base con Prisma implementadas (findAll, findOneById, countActiveByOrganization).
- [x] DTO de filtros base funcional (`ListBankAccountsQueryDto`).
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`: sin errores.
- `pnpm --filter @atlasrep/api run typecheck`: sin errores.
- `pnpm --filter @atlasrep/api run build`: compilación exitosa.
- Verificación manual: módulo importado en `AppModule`.

## Pruebas
- Arrancar servidor local (`pnpm --filter @atlasrep/api run start:dev`) y verificar que las rutas responden.
- `GET /api/v1/bank-accounts` — responde con array vacío o con datos demo.
- `GET /api/v1/bank-accounts/:id` — responde con objeto o 404 si no existe.
- `GET /api/v1/bank-accounts/organization/:organizationId/active-count` — responde con número.

## Riesgos
- **Conflicto de rutas con módulos existentes**: si `AppModule` ya tiene una ruta `/api/v1/bank-accounts`, el módulo nuevo colisionaría. Mitigación: verificar que no existe módulo previo con ese prefijo.
- **Prisma client no generado**: si no se ejecutó `db:generate` post-migración, el cliente TypeScript no tiene los tipos del módulo financiero. Mitigación: ejecutar `pnpm --filter @atlasrep/api run db:generate` antes de compilar.

## Documentación a actualizar
- `apps/api/src/app.module.ts` — importar `BankAccountsModule`.

## Decisiones clave
- **Módulo NestJS estándar**: se usa la estructura convencional de NestJS (Module/Controller/Service) para mantener consistencia con el resto de módulos del backend.
- **Consultas de solo lectura en Bloque 1**: los primeros módulos exponen solo endpoints GET para establecer la base de consulta antes de agregar escritura en bloques posteriores.

## Evidencia documental
- `apps/api/src/modules/bank-accounts/bank-accounts.module.ts`
- `apps/api/src/modules/bank-accounts/bank-accounts.controller.ts`
- `apps/api/src/modules/bank-accounts/bank-accounts.service.ts`
- `apps/api/src/modules/bank-accounts/dto/list-bank-accounts-query.dto.ts`

## Pendientes para la siguiente task
- `T-1301` crea el módulo `FinancialMovements` con el mismo patrón.

## Pendientes no resueltos
- Ninguno.
