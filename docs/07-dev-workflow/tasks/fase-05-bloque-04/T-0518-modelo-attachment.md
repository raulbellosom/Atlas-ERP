# T-0518 - Crear modelo Attachment

## Metadatos
- ID: `T-0518`
- Fase: `Fase 5`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear el modelo `Attachment` para metadata de archivos y adjuntos de entidades.

## Alcance
- Definir campos de archivo, referencia de entidad y actor de carga.
- Definir soft delete (`deletedAt`).
- Definir relación con `Organization` y `User` opcional.

## Fuera de alcance
- Upload a MinIO/S3 y URLs firmadas (`Fase 6+`).

## Dependencias
- `T-0517` cerrada.

## Criterios de aceptación
- [x] Modelo `Attachment` implementado.
- [x] Índices para búsqueda por entidad y uploadedBy.
- [x] Alineación con blueprint técnico de adjuntos.

## Validaciones
- `prisma validate` sin errores.

## Pruebas
- `db:generate` y `db:seed` exitosos.

## Riesgos
- Sin modelo de adjuntos no se puede trazar evidencia documental de operaciones.

## Documentación a actualizar
- `docs/02-architecture/31-prisma-modelos-foundation-rbac-auditoria-config.md`
- `prisma/schema.prisma`

## Evidencia documental
- `prisma/schema.prisma`

## Pendientes no resueltos
- Ninguno.
