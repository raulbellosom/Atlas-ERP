# T-0641 - Configurar endpoints base de settings y feature flags

## Metadatos
- ID: `T-0641`
- Fase: `Fase 6`
- Bloque: `Bloque 9`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Verificar que `SettingsModule` y `FeatureFlagsModule` tienen los endpoints base completos y funcionando.

## Alcance
- Settings:
  - `GET /v1/settings` — listado (organizationId, includeGlobal, search, includeInactive).
  - `GET /v1/settings/key/:key?organizationId=` — setting por clave con fallback global.
  - `GET /v1/settings/:id` — detalle por id.
- Feature Flags:
  - `GET /v1/feature-flags` — listado (search, includeInactive).
  - `GET /v1/feature-flags/:key` — flag por clave.

## Fuera de alcance
- Endpoints de mutación — Fase 7.
- Overrides de feature flags por organización/usuario.

## Dependencias
- `T-0640` cerrada.

## Criterios de aceptación
- [x] Endpoints de settings y feature-flags verificados como operativos.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`
- `pnpm --filter @atlasrep/api run typecheck`
- `pnpm --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/settings/settings.controller.ts`
- `apps/api/src/modules/settings/settings.service.ts`
- `apps/api/src/modules/feature-flags/feature-flags.controller.ts`
- `apps/api/src/modules/feature-flags/feature-flags.service.ts`

## Pendientes no resueltos
- Ninguno.
