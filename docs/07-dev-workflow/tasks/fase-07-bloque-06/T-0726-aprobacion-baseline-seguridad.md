# T-0726 - Aprobación de baseline de seguridad y auditoría

## Metadatos
- ID: `T-0726`
- Fase: `Fase 7`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Registrar formalmente la aprobación del baseline de seguridad y auditoría de Fase 7 como base para el arranque de Fase 8 (Frontend web foundation).

## Resumen de lo implementado en Fase 7

### Autenticación y sesiones (Bloque 1-2)
- JWT HS256, 15 min TTL access token, 7 días refresh token.
- SHA-256 hashed refresh tokens en base de datos.
- SessionsService con Prisma: create, revoke, revokeAll.
- `GET /v1/sessions` + `DELETE /v1/sessions/:id`.
- PasswordService (bcryptjs cost 12).
- PasswordResetService (48-byte token SHA-256 hashed, 15 min TTL).
- SecurityModule exporta JwtTokenService + PasswordService.
- JwtAuthGuard con verificación real de firma y expiración.

### Jerarquía de roles y permisos (Bloque 2-3)
- Role.level (Int) + Role.parentRoleId (self-reference) en schema Prisma.
- PermissionsGuard async: carga permisos desde DB por userId, resuelve cadena de parentRole.
- Cache de permisos en req.user.permissions por request.
- ScopeGuard: valida organizationId y branchId de URL params vs JWT claims.
- RateLimitGuard: in-memory, keyed por método+ruta+IP.
- Todos registrados como APP_GUARD en AppModule.

### Auditoría completa (Bloque 3-5)
- AuditModule: AuditService.auditAction() disponible globalmente.
- RequestAuditInterceptor: log automático de métodos mutantes (POST/PUT/PATCH/DELETE).
- Auditoría de login/logout en AuthService.
- Auditoría de lock/unlock/activate/deactivate en UsersService.
- Auditoría de resolución de conflictos en SyncService.
- Auditoría de FILE_UPLOADED en AttachmentsService.
- AuditLog con before/after JSON para trazabilidad de cambios.

### Filtros y protección de endpoints (Bloque 4-5)
- Paginación real (offset + count) en GET /v1/audit/logs.
- Filtros: organizationId, actorId, action, entityType, entityId, source, from, to.
- @RequireAllPermissions aplicado a endpoints sensibles (auth:user:write, audit:read).
- @RateLimit aplicado a login (10/min) y refresh (20/min).

## Criterios de aprobación
- [x] JWT access tokens con TTL de 15 minutos verificado (exp-iat=900).
- [x] Refresh tokens SHA-256 hashed (no texto plano en DB).
- [x] Endpoints protegidos retornan 401 sin token.
- [x] Endpoints protegidos retornan 200 con token válido de admin.
- [x] Endpoints de usuarios sensibles protegidos con 'auth:user:write'.
- [x] Audit logs protegidos con 'audit:read'.
- [x] Rate limiting operativo: 429 tras superar límite en login.
- [x] RequestAuditInterceptor logea mutaciones automáticamente.
- [x] FILE_UPLOADED auditado en attachments.
- [x] lint + typecheck + build OK en todos los bloques de Fase 7.

## Fase 7 — COMPLETADA
**Fecha de cierre de fase: 2026-04-13**

Toda la infraestructura de seguridad, autenticación, autorización y auditoría está operativa. El backend está listo para soportar la Fase 8 (Frontend web foundation).

## Dependencias resueltas en esta fase
- T-0610 (auth JWT real → resuelto T-0700 a T-0704).
- T-0622 (JWT productivo → resuelto T-0701 a T-0703).
- T-0623 (permisos desde identidad real → resuelto T-0710 a T-0711).
- T-0624 (decorators de permisos masivos → resuelto T-0721).
- T-0625 (ScopeGuard → resuelto T-0712 a T-0713).
- T-0618 (auditoría automática → resuelto T-0714 a T-0718).

## Pendientes diferidos a fases posteriores
- Rate limiting distribuido con Redis (T-0722 in-memory, single-instance).
- Tests automatizados E2E de seguridad (Fase de testing dedicada).
- Escaneo antivirus de uploads (T-0633 diferido a hardening).
- Password reset flow completo por email (requiere servicio de email — Fase 9+).
