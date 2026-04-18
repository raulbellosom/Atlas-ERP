# T-0606 - Configurar exception filter global

## Metadatos
- ID: `T-0606`
- Fase: `Fase 6`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Crear e instalar un filtro global de excepciones que capture toda excepcion no manejada en la API y devuelva respuestas de error JSON estructuradas y consistentes.

## Criterios de aceptacion
- [x] `AllExceptionsFilter` creado en `common/filters/all-exceptions.filter.ts`.
- [x] Captura `HttpException` y cualquier otro error (`@Catch()` sin argumentos).
- [x] Respuesta estructurada: `{ statusCode, message, error, path, timestamp }`.
- [x] Errores 5xx: loggea con stack trace via `Logger.error()`.
- [x] Errores 4xx: loggea con `Logger.warn()` sin stack.
- [x] Errores internos (5xx): no expone detalles al cliente (mensaje generico).
- [x] Registrado globalmente en `main.ts` via `app.useGlobalFilters()`.
- [x] `@types/express` instalado como devDependency (necesario para tipado Request/Response).
- [x] lint ✅ · typecheck ✅ · build ✅

## Archivos creados
- `apps/api/src/common/filters/all-exceptions.filter.ts`

## Archivos modificados
- `apps/api/src/main.ts` — `app.useGlobalFilters(new AllExceptionsFilter())`
- `apps/api/package.json` — `@types/express` añadido como devDependency

## Formato de respuesta de error

```json
{
  "statusCode": 404,
  "message": "Usuario no encontrado",
  "error": { "statusCode": 404, "message": "Usuario no encontrado" },
  "path": "/api/users/999",
  "timestamp": "2026-04-13T10:30:00.000Z"
}
```

Para errores 500:
```json
{
  "statusCode": 500,
  "message": "Error interno del servidor",
  "error": "Internal Server Error",
  "path": "/api/compras",
  "timestamp": "2026-04-13T10:30:00.000Z"
}
```

## Decision: `@Catch()` vs `@Catch(HttpException)`
Se usa `@Catch()` sin argumentos para capturar TODAS las excepciones, incluyendo:
- `HttpException` y sus subclases (NotFoundException, UnauthorizedException, etc.)
- Errores de Prisma (PrismaClientKnownRequestError, etc.)
- Errores inesperados de JavaScript

Esto garantiza que ningun error escapa sin ser loggeado ni formateado correctamente.

## Pendientes no resueltos
- Manejo específico de errores Prisma resuelto en `T-0630`.
- Sentry/error tracking integration — Fase 6+.

