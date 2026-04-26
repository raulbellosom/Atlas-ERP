# Backend Foundation: Bootstrap NestJS, App, Prisma y Config

## Task de origen
- `T-0600` a `T-0604`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Objetivo
Establecer baseline operativo del backend NestJS en `apps/api` con módulo raíz, configuración validada y módulo Prisma reusable.

## Componentes implementados
- Inicialización NestJS en `apps/api` con scripts de ejecución (`start`, `dev`, `start:prod`).
- `AppModule` base en `apps/api/src/modules/app/app.module.ts`.
- `AppController` y `AppService` base con endpoints:
  - `GET /api`
  - `GET /api/health`
- `ApiConfigModule` global con `@nestjs/config` y validación de entorno (`validateEnv`).
- `PrismaModule` global y `PrismaService` con lifecycle hooks (`onModuleInit`, `onModuleDestroy`).

## Estructura modular backend (baseline)
```text
apps/api/src/
  main.ts
  config/
    app.config.ts
    config.module.ts
    env.validation.ts
  infrastructure/
    prisma/
      prisma.module.ts
      prisma.service.ts
  modules/
    app/
      app.module.ts
      app.controller.ts
      app.service.ts
    auth/
    users/
    organizations/
    roles/
    permissions/
    branches/
    settings/
    feature-flags/
    audit/
    attachments/
    notifications/
    sync/
    health/
```

## Convenciones aplicadas
- NestJS modular por dominio (`modules/*`).
- Configuración central global con validación estricta de env vars.
- Prisma como provider global para acceso a datos.
- Prefijo global `api` configurable (`API_PREFIX`, default `api`).

## Ajustes operativos de build y runtime
- `build` de API vía `tsc -p tsconfig.build.json`.
- `tsconfig.build.json` con `incremental: false` para emisión reproducible de `dist/**`.
- `nest-cli.json` agregado para toolchain NestJS.
- `@atlaserp/config` enlazado en `apps/api` para resolver ESLint compartido.

## Validación técnica ejecutada
- `pnpm --filter @atlaserp/api run lint` ✅
- `pnpm --filter @atlaserp/api run typecheck` ✅
- `pnpm --filter @atlaserp/api run build` ✅
- Smoke test runtime (`node dist/main.js`) con respuestas:
  - `GET /api/health` → `{"status":"ok", ...}`
  - `GET /api` → `{"name":"Atlas ERP API", ...}`

## Notas de alcance
- Logger, filtros, interceptors, validation pipe y health module dedicado se cubren en `T-0605+`.
- Auth y módulos de dominio reales se habilitan en bloques posteriores de Fase 6.

## Actualización de avance (Bloque 3)
- Fecha: `2026-04-13`
- Tasks relacionadas: `T-0610` a `T-0614`
- Módulos foundation activos e integrados en `AppModule`:
  - `AuthModule` (contrato base `status/login/register`, estrategia final diferida a Fase 7)
  - `UsersModule` (consultas de usuarios)
  - `RolesModule` (consultas de roles + conteos de relaciones)
  - `PermissionsModule` (catálogo de permisos por `key/module/action`)
  - `OrganizationsModule` (consultas por `id/slug` y búsqueda)

## Actualización de avance (Bloque 4)
- Fecha: `2026-04-13`
- Tasks relacionadas: `T-0615` a `T-0619`
- Módulos foundation activos e integrados en `AppModule`:
  - `BranchesModule` (consultas de sucursales y conteo activo por organización)
  - `SettingsModule` (lectura de settings globales y por organización)
  - `FeatureFlagsModule` (catálogo de flags por `key`)
  - `AuditModule` (consulta de bitácora por filtros y detalle)
  - `AttachmentsModule` (consulta de adjuntos por entidad/organización)

## Actualización de avance (Bloque 5)
- Fecha: `2026-04-13`
- Tasks relacionadas: `T-0620` a `T-0624`
- Módulos y seguridad foundation activos:
  - `NotificationsModule` (consulta de notificaciones y conteo de no leídas)
  - `SyncModule` (consulta de sesiones de sync, conflictos abiertos y resumen)
  - `JwtAuthGuard` global con soporte de rutas públicas explícitas (`@Public()`)
  - `PermissionsGuard` y `RolesGuard` globales por metadata
  - Decorators de permisos listos para adopción incremental:
    - `RequireAllPermissions(...)`
    - `RequireAnyPermission(...)`

## Actualización de avance (Bloque 6)
- Fecha: `2026-04-13`
- Tasks relacionadas: `T-0625` a `T-0629`
- Capas comunes foundation activas:
  - Decorators de scope organizacional/sucursal:
    - `RequireOrganizationScope()`
    - `RequireBranchScope()`
    - `CurrentOrganizationId`
    - `CurrentBranchId`
  - Utilidades comunes de request y normalización numérica (`common/utils`)
  - DTO conventions base en `common/dto`
  - Paginación base reutilizable en `common/pagination` (adoptada en `SyncModule`)
  - Filtros base reutilizables en `common/query-filters` (adoptados en módulos foundation)

## Actualización de avance (T-0630)
- Fecha: `2026-04-13`
- Task relacionada: `T-0630`
- Manejo estándar de errores consolidado:
  - Contrato uniforme de respuesta de error (`statusCode`, `code`, `message`, `error`, `path`, `timestamp`, `details?`)
  - Catálogo de códigos de error en `common/errors/error-codes.ts`
  - Mapper de errores Prisma en `common/errors/prisma-error.mapper.ts`
  - `AllExceptionsFilter` actualizado con mapping explícito de errores Prisma (`P2002`, `P2025`, `P2003`)

## Actualización de avance (Bloque 7)
- Fecha: `2026-04-13`
- Tasks relacionadas: `T-0631` a `T-0634`
- Serialización y archivos seguros:
  - Serialización estándar de respuestas en interceptor global (`Date`, `bigint`, `undefined`)
  - Infraestructura MinIO/S3 en `infrastructure/storage` con bucket bootstrap al arranque
  - Subida segura de adjuntos con validación de tamaño/tipo/extensión y sanitización de nombre/path
  - Descarga segura con URLs firmadas temporales y validación de scope organizacional

