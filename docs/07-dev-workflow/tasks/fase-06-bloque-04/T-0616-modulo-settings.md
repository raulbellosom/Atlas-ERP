# T-0616 - Configurar módulo Settings

## Metadatos
- ID: `T-0616`
- Fase: `Fase 6`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar el módulo `Settings` con consultas de configuración global y por organización.

## Alcance
- Crear `SettingsModule`, `SettingsController`, `SettingsService`.
- Crear `ListSettingsQueryDto`.
- Exponer rutas:
  - `GET /api/v1/settings`
  - `GET /api/v1/settings/:id`
  - `GET /api/v1/settings/key/:key?organizationId=<id>`
- Soportar lectura combinada de settings globales y específicos por organización.

## Fuera de alcance
- Escritura de settings.
- Versionado/auditoría de cambios de settings.

## Dependencias
- `T-0615` cerrada.
- Modelo `Setting` disponible desde Fase 5.

## Criterios de aceptación
- [x] Módulo `settings` creado e importado.
- [x] Servicio Prisma con filtros por `organizationId`, `search`, `includeGlobal`, `includeInactive`.
- [x] Endpoints base de lectura operativos.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/settings/settings.module.ts`
- `apps/api/src/modules/settings/settings.controller.ts`
- `apps/api/src/modules/settings/settings.service.ts`
- `apps/api/src/modules/settings/dto/list-settings.query.dto.ts`
- `apps/api/src/modules/app/app.module.ts`

## Pendientes no resueltos
- Ninguno.
