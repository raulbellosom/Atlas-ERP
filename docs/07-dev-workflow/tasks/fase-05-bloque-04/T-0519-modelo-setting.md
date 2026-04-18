# T-0519 - Crear modelo Setting

## Metadatos
- ID: `T-0519`
- Fase: `Fase 5`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear el modelo `Setting` para configuración global y por organización.

## Alcance
- Definir `organizationId` opcional para scope global/tenant.
- Definir `key`/`value` y metadatos básicos.
- Definir relación opcional de actualización con `User`.

## Fuera de alcance
- Motor de aplicación de settings en runtime (`Fase 6+`).

## Dependencias
- `T-0518` cerrada.

## Criterios de aceptación
- [x] Modelo `Setting` implementado.
- [x] Unicidad por (`organizationId`, `key`) definida.
- [x] Índices base para consultas por clave/estado.

## Validaciones
- `prisma validate` sin errores.

## Pruebas
- `db:generate` y `db:seed` exitosos.

## Riesgos
- Sin `Setting` se limita configuración dinámica por tenant.

## Documentación a actualizar
- `docs/02-architecture/31-prisma-modelos-foundation-rbac-auditoria-config.md`
- `prisma/schema.prisma`

## Evidencia documental
- `prisma/schema.prisma`

## Pendientes no resueltos
- Ninguno.
