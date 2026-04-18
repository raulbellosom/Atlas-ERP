# T-0708 - Implementar activacion/desactivacion de usuarios

## Metadatos
- ID: `T-0708`
- Fase: `Fase 7`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Implementar activacion/desactivacion de cuentas de usuario con revocacion automatica de sesiones al desactivar.

## Alcance
- Actualizar `apps/api/src/modules/users/users.service.ts`:
  - `activateUser(userId)`:
    - Verifica que el usuario existe.
    - Actualiza `isActive=true`.
    - Retorna UserSummary actualizado.
  - `deactivateUser(userId, organizationId)`:
    - Verifica que el usuario existe.
    - Llama `SessionsService.revokeAllUserSessions(userId, orgId)`.
    - Actualiza `isActive=false`.
    - Retorna UserSummary actualizado.
- Actualizar `apps/api/src/modules/users/users.controller.ts`:
  - `POST /v1/users/:id/activate` → llama activateUser.
  - `DELETE /v1/users/:id/deactivate` → llama deactivateUser con req.user.organizationId.

## Resultados
- POST /v1/users/:id/activate → isActive:true.
- DELETE /v1/users/:id/deactivate → isActive:false, sesiones revocadas.
- Login de usuario inactivo → 401 "Usuario inactivo."

## Criterios de aceptacion
- [x] activateUser actualiza isActive=true.
- [x] deactivateUser revoca sesiones y actualiza isActive=false.
- [x] 404 si el usuario no existe.
- [x] isActive check en AuthService.login() retorna 401.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Soft-delete de usuario (deletedAt field, operacion irreversible con flujo de aprobacion).
- Notificacion al usuario al ser desactivado.

## Dependencias
- T-0701 cerrada (SessionsService.revokeAllUserSessions).
- T-0707 cerrada (patron de lock/unlock como referencia).

## Pendientes no resueltos
- Ninguno.
