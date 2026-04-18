# T-0603 - Configurar módulo Prisma

## Metadatos
- ID: `T-0603`
- Fase: `Fase 6`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Configurar módulo Prisma global para acceso centralizado a datos en backend NestJS.

## Alcance
- Crear `PrismaModule` global.
- Crear `PrismaService` extendiendo `PrismaClient`.
- Implementar lifecycle hooks de conexión/desconexión.
- Consumir `DATABASE_URL` desde configuración de entorno.

## Fuera de alcance
- Repositorios o servicios de dominio sobre Prisma.

## Dependencias
- `T-0602` cerrada.

## Criterios de aceptación
- [x] `PrismaModule` y `PrismaService` implementados.
- [x] Servicio exportado para inyección en módulos posteriores.
- [x] API arranca con conexión Prisma en entorno local.

## Validaciones
- `build`, `typecheck` y arranque `start:prod` sin errores de Prisma.

## Pruebas
- Smoke test de arranque con PostgreSQL local.

## Riesgos
- Sin módulo Prisma centralizado, acceso a datos queda inconsistente entre módulos.

## Documentación a actualizar
- `docs/02-architecture/37-backend-foundation-bootstrap-nestjs-prisma-config.md`
- `apps/api/src/infrastructure/prisma/*`

## Evidencia documental
- `apps/api/src/infrastructure/prisma/prisma.module.ts`
- `apps/api/src/infrastructure/prisma/prisma.service.ts`

## Pendientes no resueltos
- Ninguno.
