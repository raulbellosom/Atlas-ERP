# T-0512 - Crear modelo User

## Metadatos
- ID: `T-0512`
- Fase: `Fase 5`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear el modelo `User` con alcance por organización y sucursal opcional.

## Alcance
- Definir campos base de usuario.
- Definir relación obligatoria con `Organization`.
- Definir relación opcional con `Branch`.
- Definir unicidad de email por tenant.

## Fuera de alcance
- Relación de roles por usuario (`T-0515`).

## Dependencias
- `T-0511` cerrada.

## Criterios de aceptación
- [x] Modelo `User` implementado.
- [x] Constraint `@@unique([organizationId, email])` definida.
- [x] Índices para tenant y branch definidos.

## Validaciones
- `prisma validate` y `db:generate` sin errores.

## Pruebas
- Seed pipeline ejecuta sin error tras cambio de schema.

## Riesgos
- Sin modelo de usuario foundation, no puede construirse auth/permisos.

## Documentación a actualizar
- `docs/02-architecture/30-prisma-modelos-foundation-core-platform.md`
- `prisma/schema.prisma`

## Evidencia documental
- `prisma/schema.prisma`

## Pendientes no resueltos
- Ninguno.
