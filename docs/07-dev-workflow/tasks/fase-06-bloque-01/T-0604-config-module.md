# T-0604 - Configurar config module

## Metadatos
- ID: `T-0604`
- Fase: `Fase 6`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar módulo de configuración global con validación estricta de variables de entorno.

## Alcance
- Crear `ApiConfigModule` usando `@nestjs/config` global.
- Conectar validación `validateEnv` de `apps/api/src/config/env.validation.ts`.
- Agregar `app.config.ts` para `port`, `apiPrefix` y `nodeEnv`.
- Consumir configuración en `main.ts` para arranque controlado.

## Fuera de alcance
- Configuración por dominio y secretos de producción.

## Dependencias
- `T-0603` cerrada.

## Criterios de aceptación
- [x] ConfigModule global implementado.
- [x] Validación de entorno integrada al arranque.
- [x] `main.ts` consume configuración central en lugar de lectura directa de `process.env`.

## Validaciones
- Arranque local exitoso con variables requeridas.
- `lint`, `typecheck` y `build` de API en verde.

## Pruebas
- Smoke test de endpoints base con configuración cargada.

## Riesgos
- Sin config module global, la configuración se fragmenta y aumenta riesgo de drift entre ambientes.

## Documentación a actualizar
- `docs/02-architecture/37-backend-foundation-bootstrap-nestjs-prisma-config.md`
- `apps/api/src/config/config.module.ts`
- `apps/api/src/config/app.config.ts`
- `apps/api/src/main.ts`

## Evidencia documental
- `apps/api/src/config/config.module.ts`
- `apps/api/src/config/app.config.ts`
- `apps/api/src/config/env.validation.ts`
- `apps/api/src/main.ts`

## Pendientes no resueltos
- Ninguno.
