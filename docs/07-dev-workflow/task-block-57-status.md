# task-block-57 — Fase 7 Bloque 1: Autenticacion y seguridad base

## Estado: CERRADO

## Tasks del bloque
| Task | Titulo | Estado |
|------|--------|--------|
| T-0700 | Definir estrategia final de auth (ADR) | closed |
| T-0701 | Implementar JWT access/refresh tokens | closed |
| T-0702 | Implementar hashing seguro de contrasenas | closed |
| T-0703 | Implementar bootstrap del usuario root | closed |
| T-0704 | Implementar politica de recuperacion de contrasena | closed |

## Resumen de implementacion

### Nuevos archivos
- `apps/api/src/common/security/jwt-token.service.ts` — firma/verifica JWT HS256, genera/hashea refresh tokens
- `apps/api/src/common/security/password.service.ts` — bcryptjs hash/verify, cost 12
- `apps/api/src/common/security/security.module.ts` — JwtModule.registerAsync + providers
- `apps/api/src/modules/sessions/sessions.service.ts` — CRUD de sesiones y refresh tokens en PostgreSQL
- `apps/api/src/modules/sessions/sessions.module.ts` — modulo de sesiones
- `apps/api/src/modules/auth/password-reset.service.ts` — generacion y validacion de tokens de reset (SHA-256)

### Archivos modificados
- `apps/api/src/modules/auth/auth.service.ts` — login/refresh/logout/getProfile reales
- `apps/api/src/modules/auth/auth.controller.ts` — pasa ip/userAgent en login, usa AuthenticatedRequest
- `apps/api/src/modules/auth/auth.module.ts` — importa SecurityModule, SessionsModule, UsersModule
- `apps/api/src/common/guards/jwt-auth.guard.ts` — verificacion JWT real con JwtTokenService
- `apps/api/src/modules/app/app.module.ts` — importa SecurityModule para APP_GUARD
- `apps/api/src/modules/users/users.service.ts` — findForAuth, touchLastLogin, USER_AUTH_SELECT
- `prisma/schema.prisma` — passwordHash, isLocked, lockedAt, lastLoginAt en User; modelo PasswordResetToken
- `prisma/seeds/users.seed.ts` — hashea contrasenas con bcryptjs cost 12
- `apps/api/.env` — JWT_EXPIRES_IN corregido de 7d a 15m
- `docs/02-architecture/38-estrategia-auth-jwt.md` — ADR de estrategia auth

## Smoke test Fase 7 Bloque 1
- `POST /api/v1/auth/login` (credenciales correctas) → 200, access token JWT HS256 TTL 900s, refresh token opaco
- `GET /api/v1/auth/me` (token valido) → 200, perfil de usuario
- `POST /api/v1/auth/refresh` → 200, nuevo access token + refresh token rotado
- `POST /api/v1/auth/login` (password incorrecto) → 401
- `GET /api/v1/auth/me` (sin token) → 401
- `expiresIn: 900` verificado en respuesta de login y refresh

## Validaciones
- `lint` ✅
- `typecheck` ✅
- `build` ✅
- smoke test ✅

## Fecha de cierre
2026-04-13
