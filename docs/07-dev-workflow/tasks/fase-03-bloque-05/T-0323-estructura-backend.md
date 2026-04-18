# T-0323 - Crear estructura de carpetas oficial del backend

## Metadatos
- ID: `T-0323`
- Fase: `Fase 3`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Crear la estructura de directorios oficial de `apps/api/src/` siguiendo el blueprint técnico del backend (NestJS modular), con `main.ts` como entry point.

## Criterios de aceptación
- [x] `apps/api/src/main.ts` — entry point NestJS con prefijo global `/api` y puerto configurable.
- [x] `apps/api/src/modules/` — directorio de feature modules (auth, users, etc.).
- [x] `apps/api/src/common/decorators/` — decoradores personalizados.
- [x] `apps/api/src/common/filters/` — exception filters globales.
- [x] `apps/api/src/common/guards/` — guards de autenticación/autorización.
- [x] `apps/api/src/common/interceptors/` — interceptors (audit, logging, transform).
- [x] `apps/api/src/common/pipes/` — pipes de validación.
- [x] `apps/api/src/config/` — configuración de la app (env validation, app config module).
- [x] `apps/api/src/infrastructure/prisma/` — PrismaService y módulo de Prisma.
- [x] `apps/api/src/infrastructure/redis/` — RedisService para BullMQ.
- [x] `apps/api/src/infrastructure/storage/` — StorageService para MinIO/S3.

## Estructura creada

```
apps/api/src/
  main.ts                         Entry point
  modules/                        Feature modules (por dominio)
  common/
    decorators/                   Decoradores reutilizables
    filters/                      Exception filters
    guards/                       Auth guards
    interceptors/                 Audit, logging, transform
    pipes/                        Validacion de DTOs
  config/                         Env validation, configuracion
  infrastructure/
    prisma/                       PrismaService
    redis/                        RedisService (BullMQ)
    storage/                      StorageService (MinIO)
```

## Archivos creados
- `apps/api/src/main.ts`
- `.gitkeep` en cada directorio vacío

## Decisiones técnicas
- **`modules/` por dominio**: Cada feature (auth, users, sales, etc.) tendrá su propio módulo NestJS.
- **`common/` vs `modules/`**: `common/` contiene código transversal (guards, interceptors). Los feature modules van en `modules/`.
- **`infrastructure/`**: Separa los servicios de acceso a datos externos (Prisma, Redis, MinIO) de la lógica de negocio.
- **Prefijo global `/api`**: Todas las rutas quedan bajo `/api/...` — compatible con el nginx reverse proxy de prod.

## Pendientes no resueltos
- El AppModule, módulos de feature y los servicios de infraestructura se implementan en Fase 6.
