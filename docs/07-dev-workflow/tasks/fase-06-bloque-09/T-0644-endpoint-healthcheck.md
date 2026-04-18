# T-0644 - Configurar endpoint healthcheck

## Metadatos
- ID: `T-0644`
- Fase: `Fase 6`
- Bloque: `Bloque 9`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Verificar que el healthcheck está operativo y es accesible sin autenticación.

## Alcance
- `GET /api/health` — retorna `{ status: 'ok', timestamp, uptime }`.
- Decorado con `@Public()` — bypassa `JwtAuthGuard`.
- Utilizado por Docker healthcheck y nginx `depends_on`.

## Fuera de alcance
- Checks de conectividad a BD/Redis/MinIO — Fase 7+.

## Dependencias
- `T-0643` cerrada.

## Criterios de aceptación
- [x] Endpoint `GET /api/health` accesible sin Bearer token.
- [x] Respuesta incluye `status`, `timestamp`, `uptime`.
- [x] `lint` ✅ · `typecheck` ✅ · `build` ✅

## Validaciones
- `pnpm --filter @atlasrep/api run lint`
- `pnpm --filter @atlasrep/api run typecheck`
- `pnpm --filter @atlasrep/api run build`

## Evidencia documental
- `apps/api/src/modules/health/health.controller.ts`

## Pendientes no resueltos
- Ninguno.
