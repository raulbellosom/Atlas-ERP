# T-0703 - Implementar bootstrap del usuario root

## Metadatos
- ID: `T-0703`
- Fase: `Fase 7`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Actualizar el seed de usuarios para que incluya `passwordHash` generado con bcryptjs (cost 12), permitiendo el login real de los usuarios fundacionales desde el inicio del sistema.

## Alcance
- Actualizar `prisma/seeds/users.seed.ts`:
  - Importar `bcryptjs`.
  - Hashear `AtlasERP.2026!` con cost 12 antes del upsert.
  - Incluir `passwordHash` en campos `create` y `update` del upsert.
  - Agregar `isActive: true` y `deletedAt: null` en el update.
  - Log con advertencia sobre la contrasena dev por defecto.
- Actualizar `UsersService` con:
  - `USER_AUTH_SELECT` incluyendo `passwordHash`, `isLocked`, `lockedAt`, `lastLoginAt`.
  - `UserForAuth` type exportado.
  - `findForAuth(organizationId, email)` para busqueda en login.
  - `touchLastLogin(userId)` para actualizar `lastLoginAt`.
- Re-ejecutar el seed para que los usuarios tengan `passwordHash`.

## Resultados
- Tres usuarios fundacionales (admin, tesorero, auditor) con `passwordHash` almacenado.
- Login de `admin@atlaserp.local` / `AtlasERP.2026!` funciona exitosamente.
- `touchLastLogin` actualiza el campo `lastLoginAt` en cada login.

## Criterios de aceptacion
- [x] Seed ejecutado exitosamente con `passwordHash` en todos los usuarios.
- [x] Login real de admin funciona (smoke test OK).
- [x] `findForAuth` retorna usuario con campos de auth.
- [x] `touchLastLogin` actualiza campo en DB.
- [x] `lint` + `typecheck` sin errores.

## Fuera de alcance
- Interfaz de cambio de contrasena por el usuario.
- Politica de expiracion de contrasena.

## Dependencias
- T-0702 cerrada (PasswordService con bcryptjs).

## Pendientes no resueltos
- Ninguno.
