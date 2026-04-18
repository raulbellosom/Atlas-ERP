# T-0716 - Implementar auditoria de login/logout

## Metadatos
- ID: `T-0716`
- Fase: `Fase 7`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Registrar eventos de autenticacion (login exitoso, logout) en el AuditLog para trazabilidad de accesos.

## Alcance
- Actualizar `apps/api/src/modules/auth/auth.service.ts`:
  - Inyectar `AuditService`.
  - `login()` exitoso: auditAction({action:'USER_LOGIN', entityType:'User', entityId:user.id, actorId:user.id, result:'SUCCESS', metadata:{sessionId, ipAddress, userAgent}}).
  - `logout()` con sessionId: auditAction({action:'USER_LOGOUT', entityType:'Session', entityId:sessionId, result:'SUCCESS'}).
  - `logout()` allSessions: auditAction({action:'USER_LOGOUT', entityType:'Session', entityId:'ALL', metadata:{scope:'all_sessions'}}).
- Actualizar `apps/api/src/modules/auth/auth.module.ts` — importa AuditModule.

## Resultados
- Login de admin genera USER_LOGIN en AuditLog con result: SUCCESS.
- Logout genera USER_LOGOUT con scope indicado.
- GET /v1/audit/logs muestra ambos tipos de eventos.

## Criterios de aceptacion
- [x] login() exitoso genera USER_LOGIN audit.
- [x] logout() genera USER_LOGOUT con scope correcto.
- [x] metadata incluye sessionId en login.
- [x] `lint` + `typecheck` + `build` OK.

## Fuera de alcance
- Login fallido por credenciales incorrectas (el usuario puede no existir en DB, no tenemos organizationId valido para loguear).
- Rate limiting por intentos fallidos (T-0722).

## Dependencias
- T-0714 cerrada (AuditService.auditAction disponible).
- T-0701 cerrada (AuthService.login/logout implementados).

## Pendientes no resueltos
- Ninguno.
