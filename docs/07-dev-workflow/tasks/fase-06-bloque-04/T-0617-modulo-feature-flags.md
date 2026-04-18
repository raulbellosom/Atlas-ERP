# T-0617 - Configurar módulo FeatureFlags

## Metadatos
- ID: `T-0617`
- Fase: `Fase 6`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar el módulo `FeatureFlags` para consulta del catálogo de banderas funcionales del sistema.

## Alcance
- Crear `FeatureFlagsModule`, `FeatureFlagsController`, `FeatureFlagsService`.
- Crear `ListFeatureFlagsQueryDto`.
- Exponer rutas:
  - `GET /api/v1/feature-flags`
  - `GET /api/v1/feature-flags/:key`
- Integrar módulo en `AppModule`.

## Fuera de alcance
- Activación/desactivación de flags por endpoint.
- Segmentación avanzada por tenant/usuario.

## Dependencias
- `T-0616` cerrada.
- Modelo `FeatureFlag` disponible desde Fase 5.

## Criterios de aceptación
- [x] Módulo `feature-flags` creado e importado.
- [x] Servicio Prisma con filtros por `includeInactive` y `search`.
- [x] Consulta por `key` implementada.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm.cmd --filter @atlasrep/api run lint`
- `pnpm.cmd --filter @atlasrep/api run typecheck`
- `pnpm.cmd --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/feature-flags/feature-flags.module.ts`
- `apps/api/src/modules/feature-flags/feature-flags.controller.ts`
- `apps/api/src/modules/feature-flags/feature-flags.service.ts`
- `apps/api/src/modules/feature-flags/dto/list-feature-flags.query.dto.ts`
- `apps/api/src/modules/app/app.module.ts`

## Pendientes no resueltos
- Ninguno.
