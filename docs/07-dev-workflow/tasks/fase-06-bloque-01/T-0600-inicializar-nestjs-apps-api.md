# T-0600 - Inicializar NestJS en `apps/api`

## Metadatos
- ID: `T-0600`
- Fase: `Fase 6`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Inicializar la base de ejecución NestJS en `apps/api` con dependencias y scripts operativos de arranque/build.

## Alcance
- Agregar dependencias NestJS y runtime base (`@nestjs/*`, `reflect-metadata`, `rxjs`).
- Agregar herramientas de desarrollo NestJS (`@nestjs/cli`, `@nestjs/schematics`, `@types/node`).
- Configurar scripts base de ejecución (`start`, `dev`, `start:prod`, `build`).
- Agregar `nest-cli.json` y `tsconfig.build.json`.

## Fuera de alcance
- Implementación de módulos de dominio (auth/users/etc.).

## Dependencias
- Fase 5 completada (`T-0540` cerrada).

## Criterios de aceptación
- [x] `apps/api` ejecuta build de backend sin errores.
- [x] Scripts base NestJS operativos.
- [x] Toolchain de NestJS documentado y versionado.

## Validaciones
- `pnpm --filter @atlasrep/api run build` exitoso.
- `pnpm --filter @atlasrep/api run typecheck` exitoso.

## Pruebas
- Smoke test de arranque en `start:prod` con entorno local.

## Riesgos
- Sin baseline NestJS no se puede construir la Fase 6 modular.

## Documentación a actualizar
- `docs/02-architecture/37-backend-foundation-bootstrap-nestjs-prisma-config.md`
- `apps/api/package.json`
- `apps/api/nest-cli.json`
- `apps/api/tsconfig.build.json`

## Evidencia documental
- `apps/api/package.json`
- `apps/api/nest-cli.json`
- `apps/api/tsconfig.build.json`

## Pendientes no resueltos
- Ninguno.
