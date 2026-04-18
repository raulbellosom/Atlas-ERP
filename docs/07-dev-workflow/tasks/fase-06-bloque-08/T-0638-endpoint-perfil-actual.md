# T-0638 - Configurar endpoint de perfil actual

## Metadatos
- ID: `T-0638`
- Fase: `Fase 6`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Agregar endpoint `GET /api/v1/auth/me` que retorna el perfil del usuario autenticado actualmente. En Fase 6 es un stub (NotImplementedException) ya que el JwtAuthGuard no decodifica el token real; se completa en Fase 7.

## Alcance
- Endpoint `GET /v1/auth/me` en `AuthController` (no @Public — requiere Bearer token).
- `AuthService.getProfile()` como stub `NotImplementedException` con mensaje descriptivo.
- El endpoint ya valida que exista un Bearer token (gracias al `JwtAuthGuard`).

## Fuera de alcance
- Decodificación JWT y lookup de usuario en BD (Fase 7).
- Cache de perfil.

## Dependencias
- `T-0637` cerrada.

## Criterios de aceptación
- [x] Endpoint `GET /v1/auth/me` registrado y accesible.
- [x] Requiere Bearer token (no es @Public).
- [x] Retorna `501 Not Implemented` con mensaje claro en Fase 6.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`
- `pnpm --filter @atlasrep/api run typecheck`
- `pnpm --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/auth/auth.controller.ts`
- `apps/api/src/modules/auth/auth.service.ts`

## Pendientes no resueltos
- Ninguno. Se implementa en Fase 7 con JWT decoding real.
