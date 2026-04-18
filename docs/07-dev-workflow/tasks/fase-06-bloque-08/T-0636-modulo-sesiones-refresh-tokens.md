# T-0636 - Configurar módulo de sesiones/refresh tokens

## Metadatos
- ID: `T-0636`
- Fase: `Fase 6`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Crear `SessionsModule` con `SessionsService` que expone operaciones Prisma sobre los modelos `Session` y `RefreshToken`, listos para ser consumidos por el flujo de auth en Fase 7.

## Alcance
- `SessionsService` con métodos:
  - `createSession(input)`: crea sesión ACTIVE con expiración.
  - `findActiveSession(sessionId)`: busca sesión ACTIVE; expira automáticamente si caducó.
  - `findSessionsByUser(userId, organizationId)`: lista sesiones ACTIVE de un usuario.
  - `touchSession(sessionId)`: actualiza `lastActivityAt`.
  - `revokeSession(sessionId)`: revoca sesión y sus refresh tokens activos (en transacción).
  - `revokeAllUserSessions(userId, organizationId)`: revoca todas las sesiones del usuario.
  - `createRefreshToken(input)`: crea refresh token ACTIVE.
  - `findValidRefreshToken(tokenHash)`: busca token ACTIVE no expirado; marca EXPIRED si caducó.
  - `rotateRefreshToken(oldHash, newInput)`: invalida el anterior (ROTATED) y crea uno nuevo (en transacción).
- `SessionsModule` exporta `SessionsService`.
- `SessionsModule` registrado en `AppModule`.
- `AuthModule` importa `SessionsModule` para disponibilidad futura.

## Fuera de alcance
- Signing de JWT (Fase 7).
- DeviceRegistry management.

## Dependencias
- `T-0635` cerrada.

## Criterios de aceptación
- [x] `SessionsService` implementado con todos los métodos.
- [x] `SessionsModule` creado y exportado.
- [x] Registrado en `AppModule` e importado en `AuthModule`.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`
- `pnpm --filter @atlasrep/api run typecheck`
- `pnpm --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/sessions/sessions.service.ts`
- `apps/api/src/modules/sessions/sessions.module.ts`
- `apps/api/src/modules/app/app.module.ts`
- `apps/api/src/modules/auth/auth.module.ts`

## Pendientes no resueltos
- Ninguno. Capa de sesiones lista para wiring con JWT en Fase 7.
