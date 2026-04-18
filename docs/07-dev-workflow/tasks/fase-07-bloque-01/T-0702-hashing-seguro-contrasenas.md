# T-0702 - Implementar hashing seguro de contrasenas

## Metadatos
- ID: `T-0702`
- Fase: `Fase 7`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Implementar `PasswordService` con bcryptjs (pure JS, sin native bindings) para hashing y verificacion de contrasenas, con cost factor 12.

## Alcance
- Crear `apps/api/src/common/security/password.service.ts`:
  - `hash(plaintext)` → `bcrypt.hash(plaintext, 12)`.
  - `verify(plaintext, hash)` → `bcrypt.compare(plaintext, hash)`.
- Exportar desde `SecurityModule`.
- Agregar `passwordHash String?`, `isLocked Boolean @default(false)`, `lockedAt DateTime?`, `lastLoginAt DateTime?` al modelo `User` en `prisma/schema.prisma`.
- Agregar `PasswordResetToken` model al schema con `tokenHash @unique`, `expiresAt`, `usedAt`, `organizationId`, `userId`.
- Ejecutar `prisma db push` para aplicar cambios al schema.
- Verificar que `passwordHash` esta disponible en los tipos generados de Prisma.

## Resultados
- `PasswordService` creado y exportado desde `SecurityModule`.
- Schema actualizado con `passwordHash` en `User` y nuevo modelo `PasswordResetToken`.
- `prisma db push` ejecutado exitosamente.
- Tipos Prisma regenerados con los nuevos campos.

## Criterios de aceptacion
- [x] `PasswordService` inyectable via `SecurityModule`.
- [x] `bcrypt.hash` y `bcrypt.compare` funcionan correctamente.
- [x] Schema de Prisma actualizado y aplicado a la base de datos.
- [x] `passwordHash` presente en tipos Prisma generados.
- [x] `lint` + `typecheck` sin errores.

## Fuera de alcance
- Politica de complejidad de contrasenas (T-0707).
- Password reset flow completo (T-0704).

## Dependencias
- T-0700 cerrada (ADR auth - justifica bcryptjs cost 12).

## Pendientes no resueltos
- Ninguno.
