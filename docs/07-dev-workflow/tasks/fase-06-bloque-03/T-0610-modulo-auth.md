# T-0610 - Configurar módulo Auth

## Metadatos
- ID: `T-0610`
- Fase: `Fase 6`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar el módulo `Auth` en backend como base contractual para autenticación (`login/register`) sin adelantar la estrategia final de seguridad definida para Fase 7.

## Alcance
- Crear `AuthModule` con `AuthController` y `AuthService`.
- Definir DTOs de entrada para `login` y `register`.
- Exponer rutas base:
  - `GET /api/v1/auth/status`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/register`
- Integrar `AuthModule` en `AppModule`.

## Fuera de alcance
- JWT, guards y estrategia completa de autenticación/autorización.
- Persistencia de credenciales o hash de contraseñas.

## Dependencias
- `T-0600` a `T-0609` cerradas.

## Criterios de aceptación
- [x] Módulo `auth` creado y conectado al `AppModule`.
- [x] DTOs `LoginDto` y `RegisterDto` versionados con validación.
- [x] Contrato HTTP base de auth disponible para evolución en Fase 7.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/auth/auth.module.ts`
- `apps/api/src/modules/auth/auth.controller.ts`
- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/modules/auth/dto/login.dto.ts`
- `apps/api/src/modules/auth/dto/register.dto.ts`
- `apps/api/src/modules/app/app.module.ts`

## Pendientes no resueltos
- Implementar estrategia final de autenticación (JWT + guards + sesiones/refresh tokens operativos) en Fase 7.
