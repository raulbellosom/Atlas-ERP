# T-0523 - Crear modelo SyncItem

## Metadatos
- ID: `T-0523`
- Fase: `Fase 5`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear `SyncItem` para representar cada operación individual dentro de una sesión de sync.

## Alcance
- Definir relación con `SyncSession` y `Organization`.
- Definir campos operativos (`operation`, `entityType`, `entityId`, `payload`, `status`).
- Definir campos de procesamiento y error.

## Fuera de alcance
- Motor de validación de reglas de negocio por item.

## Dependencias
- `T-0522` cerrada.

## Criterios de aceptación
- [x] Modelo `SyncItem` implementado.
- [x] Índices de consulta por sesión/estado y entidad.
- [x] Payload JSON de operación definido.

## Validaciones
- `prisma validate` sin errores.

## Pruebas
- `db:generate` y `db:seed` exitosos.

## Riesgos
- Sin itemización no se puede diagnosticar fallas individuales en sync.

## Documentación a actualizar
- `docs/02-architecture/32-prisma-modelos-foundation-featureflags-sync.md`
- `prisma/schema.prisma`

## Evidencia documental
- `prisma/schema.prisma`

## Pendientes no resueltos
- Ninguno.
