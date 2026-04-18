# T-0504 - Definir convenciones de relaciones

## Metadatos
- ID: `T-0504`
- Fase: `Fase 5`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Definir convenciones para relaciones y claves foráneas en Prisma.

## Alcance
- Convenciones de `@relation`.
- Nomenclatura de campos FK.
- Criterios de integridad referencial.

## Fuera de alcance
- Implementación de relaciones por entidad concreta.

## Dependencias
- `T-0503` cerrada.

## Criterios de aceptación
- [x] Convenciones de relaciones documentadas.
- [x] Reglas de integridad referencial definidas.

## Validaciones
- Alineación con política de ownership de datos.

## Pruebas
- Revisión documental sobre escenarios de relaciones ambiguas.

## Riesgos
- Relaciones implícitas sin criterio generan acoplamiento y errores de datos.

## Documentación a actualizar
- `docs/02-architecture/24-prisma-convenciones-relaciones.md`

## Evidencia documental
- `docs/02-architecture/24-prisma-convenciones-relaciones.md`

## Pendientes no resueltos
- Ninguno.
