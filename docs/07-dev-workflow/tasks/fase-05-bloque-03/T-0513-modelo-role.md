# T-0513 - Crear modelo Role

## Metadatos
- ID: `T-0513`
- Fase: `Fase 5`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear el modelo `Role` para control de acceso por tenant.

## Alcance
- Definir estructura base de rol.
- Definir relación obligatoria con `Organization`.
- Definir unicidad de nombre de rol por tenant.

## Fuera de alcance
- Relación de permisos por rol (`T-0516`).

## Dependencias
- `T-0512` cerrada.

## Criterios de aceptación
- [x] Modelo `Role` implementado.
- [x] Constraint `@@unique([organizationId, name])` definida.
- [x] Campos de soft delete y timestamps definidos.

## Validaciones
- `prisma validate` y `db:generate` sin errores.

## Pruebas
- Prisma Client generado correctamente.

## Riesgos
- Sin `Role`, no se puede modelar autorización por perfil operativo.

## Documentación a actualizar
- `docs/02-architecture/30-prisma-modelos-foundation-core-platform.md`
- `prisma/schema.prisma`

## Evidencia documental
- `prisma/schema.prisma`

## Pendientes no resueltos
- Ninguno.
