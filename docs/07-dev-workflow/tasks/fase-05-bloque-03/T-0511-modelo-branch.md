# T-0511 - Crear modelo Branch

## Metadatos
- ID: `T-0511`
- Fase: `Fase 5`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear el modelo `Branch` con ownership por organización.

## Alcance
- Definir `organizationId` y relación obligatoria con `Organization`.
- Definir unicidad de nombre por tenant.
- Definir relación con `User` por sucursal opcional.

## Fuera de alcance
- Reglas de negocio de sucursales en backend (`Fase 6+`).

## Dependencias
- `T-0510` cerrada.

## Criterios de aceptación
- [x] Modelo `Branch` implementado.
- [x] Relación `Branch -> Organization` definida.
- [x] Constraint `@@unique([organizationId, name])` definida.

## Validaciones
- `prisma validate` y `db:generate` sin errores.

## Pruebas
- Generación de Prisma Client exitosa.

## Riesgos
- Sin modelo de sucursal, no se puede delimitar operación por unidad.

## Documentación a actualizar
- `docs/02-architecture/30-prisma-modelos-foundation-core-platform.md`
- `prisma/schema.prisma`

## Evidencia documental
- `prisma/schema.prisma`

## Pendientes no resueltos
- Ninguno.
