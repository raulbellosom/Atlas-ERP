# T-0506 - Definir convenciones de soft delete

## Metadatos
- ID: `T-0506`
- Fase: `Fase 5`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Definir convención técnica de soft delete en Prisma alineada a la política de seguridad.

## Alcance
- Definir campo estándar.
- Definir regla de visibilidad.
- Definir criterios de hard delete excepcional.

## Fuera de alcance
- Implementación de filtros automáticos por repositorio.

## Dependencias
- `T-0505` cerrada.

## Criterios de aceptación
- [x] Convención de soft delete documentada.
- [x] Alineación con política de seguridad documentada.

## Validaciones
- Consistencia con `docs/06-security/01-politica-soft-delete.md`.

## Pruebas
- Revisión documental de coherencia con flujos de recuperación.

## Riesgos
- Soft delete inconsistente genera errores de negocio y de auditoría.

## Documentación a actualizar
- `docs/02-architecture/26-prisma-convenciones-soft-delete.md`

## Evidencia documental
- `docs/02-architecture/26-prisma-convenciones-soft-delete.md`

## Pendientes no resueltos
- Ninguno.
