# Blueprint Técnico: Backend API

## Identificación
- Aplicación: `apps/api`
- Tecnologías: NestJS + TypeScript + Prisma + PostgreSQL
- Modo: API REST + WebSockets (cuando aplique para notificaciones en tiempo real)

## Propósito
Backend central de AtlasERP. Es la fuente oficial de verdad del sistema. Gestiona autenticación, lógica de negocio, acceso a base de datos y validación de sincronización.

## Estructura de módulos NestJS

```
apps/api/src/
├─ main.ts
├─ app.module.ts
├─ common/              # Guards, interceptors, filtros, decoradores compartidos
├─ config/              # Configuración y validación de env vars
├─ modules/
│  ├─ auth/
│  ├─ users/
│  ├─ organizations/
│  ├─ roles/
│  ├─ audit/
│  ├─ attachments/
│  ├─ settings/
│  ├─ feature-flags/
│  ├─ sync/
│  └─ financial/        # Financial Operations Core
└─ prisma/              # PrismaService y módulo de Prisma
```

## Principios de diseño del backend

- **Controladores delgados**: solo reciben request, validan DTO y delegan al service.
- **Services de dominio**: contienen la lógica de negocio real.
- **Prisma como única capa de acceso a datos**: sin ORMs adicionales ni SQL crudo salvo casos justificados.
- **DTOs tipados**: toda entrada se valida con `class-validator` + `class-transformer`.
- **Guards de autenticación**: toda ruta privada usa `JwtAuthGuard` o equivalente.
- **Guards de permisos**: toda ruta sensible verifica el rol/permiso del usuario.

## Naming de endpoints (referencia)
Ver `docs/02-architecture/04-nomenclatura-endpoints-backend.md`

## Módulo de Audit
- Todo servicio que modifique datos críticos llama al `AuditService` para registrar la acción.
- El registro de auditoría es inmutable: no se actualiza ni elimina.

## Manejo de errores
- Errores de negocio: `BadRequestException`, `NotFoundException`, `ForbiddenException` de NestJS.
- Errores no esperados: capturados por filtro global y loggeados sin exponer stack al cliente.

## Variables de entorno relevantes
- `DATABASE_URL` — cadena de conexión PostgreSQL
- `JWT_SECRET` — clave de firma de tokens JWT
- `JWT_EXPIRES_IN` — duración del token
- `API_PORT` — puerto de escucha
- `REDIS_URL` — para colas y caché cuando aplique
