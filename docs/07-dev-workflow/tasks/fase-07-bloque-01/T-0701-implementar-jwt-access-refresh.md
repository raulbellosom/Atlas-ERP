# T-0701 - Implementar JWT access/refresh tokens

## Metadatos
- ID: `T-0701`
- Fase: `Fase 7`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Implementar el flujo completo de autenticación JWT: access token HS256 (15 min), refresh token opaco SHA-256 hasheado (7 dias), sesiones respaldadas en PostgreSQL, y rotacion de tokens.

## Alcance
- Crear `apps/api/src/common/security/jwt-token.service.ts`:
  - `signAccessToken(payload)` → JWT HS256, TTL configurable via `JWT_EXPIRES_IN`.
  - `verifyAccessToken(token)` → verifica y retorna JwtPayload.
  - `generateRefreshTokenRaw()` → 48 bytes hex aleatorio.
  - `hashRefreshToken(raw)` → SHA-256 hex.
  - `getAccessTokenTtlSeconds()` / `getRefreshTokenTtlSeconds()`.
- Crear `apps/api/src/common/security/security.module.ts`:
  - `JwtModule.registerAsync` con `ConfigService` (JWT_SECRET, HS256).
  - Exports: `JwtTokenService`, `PasswordService`.
- Crear `apps/api/src/modules/sessions/sessions.service.ts`:
  - `createSession`, `revokeSession`, `revokeAllUserSessions`.
  - `createRefreshToken`, `findValidRefreshToken`, `rotateRefreshToken`.
- Reescribir `apps/api/src/modules/auth/auth.service.ts`:
  - `login()`: verificar bcrypt, crear session + refresh token, firmar access token.
  - `refresh()`: rotar refresh token, emitir nuevo access token.
  - `logout()`: revocar sesion o todas las sesiones.
  - `getProfile()`: lookup por sub del JWT payload.
- Actualizar `apps/api/src/common/guards/jwt-auth.guard.ts`:
  - Verificacion real de JWT con `JwtTokenService.verifyAccessToken()`.
  - Exporta `AuthenticatedRequest` interface.
- Corregir `JWT_EXPIRES_IN=15m` en `apps/api/.env`.

## Resultados
- Login retorna `accessToken` (JWT HS256, TTL 900s) + `refreshToken` (opaco).
- GET /me con token valido retorna perfil de usuario.
- Refresh rota el token y emite nuevo access token.
- Logout revoca la sesion en base de datos.
- GET /me sin token → 401. Login con password incorrecto → 401.
- `expiresIn: 900` (15 min) confirmado en smoke test.

## Criterios de aceptacion
- [x] Login real funciona con credenciales del seed.
- [x] GET /me retorna perfil con token valido.
- [x] Refresh token rota correctamente.
- [x] 401 en rutas protegidas sin token.
- [x] JWT payload: sub, organizationId, branchId. TTL 15 min confirmado.
- [x] `lint` - `typecheck` - `build` - smoke test OK.

## Fuera de alcance
- Password reset flow completo (T-0704).
- Account lockout (T-0706).

## Dependencias
- T-0700 cerrada (ADR auth).
- T-0702 cerrada (PasswordService).

## Pendientes no resueltos
- Ninguno.
