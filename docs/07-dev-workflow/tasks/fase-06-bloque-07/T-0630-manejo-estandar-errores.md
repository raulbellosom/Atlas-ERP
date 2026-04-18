# T-0630 - Configurar manejo estándar de errores

## Metadatos
- ID: `T-0630`
- Fase: `Fase 6`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Estandarizar el manejo de errores backend con un contrato uniforme de respuesta y mapeo explícito de errores Prisma relevantes.

## Alcance
- Definir catálogo de códigos de error (`ErrorCode`).
- Definir interfaz de respuesta estándar (`StandardErrorResponse`).
- Agregar excepción de aplicación (`AppException`) para errores de dominio controlados.
- Agregar mapper de errores Prisma (`mapPrismaKnownError`) con mapping explícito:
  - `P2002` → `409 Conflict`
  - `P2025` → `404 Not Found`
  - `P2003` → `409 Conflict`
- Refactor de `AllExceptionsFilter` para emitir formato estándar:
  - `statusCode`
  - `code`
  - `message`
  - `error`
  - `path`
  - `timestamp`
  - `details` (opcional)

## Fuera de alcance
- Integración de error tracking externo (Sentry).
- Internacionalización completa de mensajes de error por locale.

## Dependencias
- `T-0629` cerrada.
- `AllExceptionsFilter` global ya activo desde `T-0606`.

## Criterios de aceptación
- [x] Contrato estándar de error implementado en backend.
- [x] Errores Prisma críticos mapeados a códigos HTTP de negocio.
- [x] Respuesta de error consistente para `HttpException`, Prisma y errores inesperados.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/common/errors/error-codes.ts`
- `apps/api/src/common/errors/error-response.interface.ts`
- `apps/api/src/common/errors/app.exception.ts`
- `apps/api/src/common/errors/prisma-error.mapper.ts`
- `apps/api/src/common/errors/index.ts`
- `apps/api/src/common/filters/all-exceptions.filter.ts`

## Pendientes no resueltos
- Integración de tracking distribuido de errores (Sentry/observabilidad) en fase posterior.
