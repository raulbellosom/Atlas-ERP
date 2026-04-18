# T-0705 - Implementar expiracion y revocacion de sesiones

## Metadatos
- ID: `T-0705`
- Fase: `Fase 7`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Exponer endpoints para que los usuarios puedan listar sus sesiones activas y revocarlas individualmente. La logica de expiracion laziness (check en findActiveSession y findValidRefreshToken) ya estaba implementada en Bloque 1.

## Alcance
- Crear `apps/api/src/modules/sessions/sessions.controller.ts`:
  - `GET /v1/sessions` — lista las sesiones activas del usuario autenticado (via req.user.sub).
  - `DELETE /v1/sessions/:id` — revoca una sesion por ID.
- Actualizar `SessionsModule` para incluir `SessionsController`.
- La respuesta de GET /sessions incluye: id, ipAddress, userAgent, status, lastActivityAt, expiresAt, createdAt.

## Resultados
- Endpoint GET /v1/sessions retorna 4 sesiones activas en smoke test.
- Endpoint DELETE /v1/sessions/:id revoca la sesion y sus refresh tokens.

## Criterios de aceptacion
- [x] GET /v1/sessions retorna array de sesiones activas del usuario.
- [x] DELETE /v1/sessions/:id revoca correctamente.
- [x] Sin exponer tokenHash u otros datos sensibles.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Listado de sesiones de otros usuarios (admin view).
- Expiracion proactiva via cron job.

## Dependencias
- T-0701 cerrada (SessionsService con todos los metodos necesarios).

## Pendientes no resueltos
- Ninguno.
