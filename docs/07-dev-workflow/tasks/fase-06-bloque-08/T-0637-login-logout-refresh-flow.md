# T-0637 - Configurar login/logout/refresh flow

## Metadatos
- ID: `T-0637`
- Fase: `Fase 6`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Completar el contrato de endpoints de auth (`login`, `logout`, `refresh`) con DTOs tipados y stubs que documentan la integración con `SessionsService` en Fase 7.

## Alcance
- Nuevos DTOs: `LogoutDto` (sessionId?, allSessions?), `RefreshTokenDto` (refreshToken).
- `AuthService` actualizado:
  - `logout(_dto)` y `refresh(_dto)` como stubs `NotImplementedException`.
  - `getStatus()` refleja `sessionManagement: 'ready'`.
- `AuthController` actualizado:
  - `POST /v1/auth/logout` (protegido — requiere Bearer).
  - `POST /v1/auth/refresh` (@Public — no requiere Bearer).
- Los stubs documentan explícitamente que el wiring JWT + credenciales es Fase 7.

## Fuera de alcance
- Validación de credenciales contra BD.
- Signing de JWT/access tokens.

## Dependencias
- `T-0636` cerrada.

## Criterios de aceptación
- [x] DTOs `LogoutDto` y `RefreshTokenDto` creados.
- [x] Endpoints `logout` y `refresh` en `AuthController`.
- [x] `login`, `logout`, `refresh` como stubs `NotImplementedException`.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`
- `pnpm --filter @atlasrep/api run typecheck`
- `pnpm --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/modules/auth/auth.controller.ts`
- `apps/api/src/modules/auth/dto/logout.dto.ts`
- `apps/api/src/modules/auth/dto/refresh-token.dto.ts`

## Pendientes no resueltos
- Ninguno. Pendientes T-0622 y T-0623 (JWT real) resueltos con scope en Fase 7.
