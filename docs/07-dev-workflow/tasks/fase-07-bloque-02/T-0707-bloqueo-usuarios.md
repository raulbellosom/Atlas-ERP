# T-0707 - Implementar bloqueo de usuarios

## Metadatos
- ID: `T-0707`
- Fase: `Fase 7`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Implementar lock/unlock de cuentas de usuario con revocacion automatica de sesiones activas al bloquear.

## Alcance
- Actualizar `apps/api/src/modules/users/users.service.ts`:
  - `lockUser(userId, organizationId)`:
    - Verifica que el usuario existe.
    - Llama `SessionsService.revokeAllUserSessions(userId, orgId)`.
    - Actualiza `isLocked=true`, `lockedAt=now`.
    - Retorna UserSummary actualizado.
  - `unlockUser(userId)`:
    - Verifica que el usuario existe.
    - Actualiza `isLocked=false`, `lockedAt=null`.
    - Retorna UserSummary actualizado.
- Actualizar `apps/api/src/modules/users/users.controller.ts`:
  - `POST /v1/users/:id/lock` → llama lockUser con req.user.organizationId.
  - `POST /v1/users/:id/unlock` → llama unlockUser.
- Inyectar `SessionsService` en `UsersService` via `SessionsModule` importado en `UsersModule`.

## Resultados
- POST /v1/users/:id/lock → isLocked:true, sesiones previas revocadas.
- POST /v1/users/:id/unlock → isLocked:false, lockedAt:null.
- Login de usuario bloqueado → 401 "Cuenta bloqueada. Contacta al administrador."

## Criterios de aceptacion
- [x] lockUser revoca sesiones y marca isLocked=true.
- [x] unlockUser restaura isLocked=false y lockedAt=null.
- [x] 404 si el usuario no existe.
- [x] Lock check en AuthService.login() retorna 401.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Lockout automatico por intentos fallidos (T-0720 aproximadamente).
- Notificacion al usuario al ser bloqueado.

## Dependencias
- T-0701 cerrada (SessionsService.revokeAllUserSessions).
- T-0702 cerrada (isLocked/lockedAt en schema User).

## Pendientes no resueltos
- Ninguno.
