# T-0607 - Configurar response interceptor global

## Metadatos
- ID: `T-0607`
- Fase: `Fase 6`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Crear e instalar un interceptor global que envuelve toda respuesta exitosa de la API en un sobre JSON consistente con metadata de timestamp.

## Criterios de aceptacion
- [x] `TransformInterceptor<T>` creado en `common/interceptors/transform.interceptor.ts`.
- [x] Implementa `NestInterceptor<T, ApiResponse<T>>` — totalmente tipado.
- [x] Respuesta envuelta: `{ data: <payload>, meta: { timestamp: string } }`.
- [x] Solo afecta respuestas 2xx — los errores pasan por `AllExceptionsFilter`.
- [x] Registrado globalmente en `main.ts` via `app.useGlobalInterceptors()`.
- [x] lint ✅ · typecheck ✅ · build ✅

## Archivos creados
- `apps/api/src/common/interceptors/transform.interceptor.ts`

## Archivos modificados
- `apps/api/src/main.ts` — `app.useGlobalInterceptors(new TransformInterceptor())`

## Formato de respuesta exitosa

Antes (respuesta directa del controller):
```json
{ "status": "ok", "timestamp": "..." }
```

Despues (con TransformInterceptor):
```json
{
  "data": { "status": "ok", "timestamp": "..." },
  "meta": { "timestamp": "2026-04-13T10:30:00.000Z" }
}
```

## Interface exportada

```typescript
export interface ApiResponse<T> {
  data: T;
  meta: { timestamp: string };
}
```
Se puede importar en el frontend para tipar las respuestas de la API.

## Pendientes no resueltos
- Paginacion en `meta` (total, page, limit) — se agregara en endpoints de listado (Fase 7+).
- Request ID en `meta` para correlacion de logs — Fase 7+.
