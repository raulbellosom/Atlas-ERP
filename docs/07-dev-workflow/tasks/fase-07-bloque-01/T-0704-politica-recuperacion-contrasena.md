# T-0704 - Implementar politica de recuperacion de contrasena

## Metadatos
- ID: `T-0704`
- Fase: `Fase 7`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Implementar `PasswordResetService` con la logica de generacion, almacenamiento seguro y validacion de tokens de recuperacion de contrasena (TTL 15 min, one-time use, SHA-256 hashed).

## Alcance
- Crear `apps/api/src/modules/auth/password-reset.service.ts`:
  - `generateRawToken()` → 48 bytes aleatorios en hex.
  - `hashToken(raw)` → SHA-256 hex (almacenado en DB, nunca el raw).
  - `createResetToken(organizationId, userId)`:
    - Invalida tokens previos del usuario (usedAt = now).
    - Crea nuevo token con TTL 15 min.
    - Retorna `{ rawToken, expiresAt }`.
  - `findValidToken(rawToken)` → busca por hash, verifica no usado y no expirado.
  - `markTokenUsed(tokenId)` → setea `usedAt = now`.
- Registrar en `AuthModule` (providers + exports).
- El raw token se envila al usuario (por email, implementado en Fase posterior).
- El hash se almacena en `PasswordResetToken` (modelo en Prisma).

## Resultados
- `PasswordResetService` implementado y inyectable.
- Tokens de 96 chars hex (48 bytes) generados con `randomBytes`.
- Hash SHA-256 almacenado en DB.
- Invalidacion de tokens previos funciona.
- TTL 15 min: `expiresAt = now + 15 * 60 * 1000`.

## Criterios de aceptacion
- [x] `PasswordResetService` creado con los 4 metodos requeridos.
- [x] Raw token nunca almacenado en DB (solo el hash SHA-256).
- [x] `createResetToken` invalida tokens previos del usuario.
- [x] `findValidToken` verifica usedAt y expiresAt.
- [x] `AuthModule` lo provee y exporta.
- [x] `lint` + `typecheck` sin errores.

## Fuera de alcance
- Envio del token por email (requiere servicio de notificaciones).
- Endpoint HTTP de reset-password (Fase posterior).

## Dependencias
- T-0702 cerrada (modelo PasswordResetToken en schema Prisma).

## Pendientes no resueltos
- Ninguno.
