# T-0507 - Definir convenciones de índices

## Metadatos
- ID: `T-0507`
- Fase: `Fase 5`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Definir convención de índices para rendimiento y consistencia en Prisma.

## Alcance
- Definir principios de indexación.
- Definir usos de índices simples, compuestos y únicos.
- Definir regla de justificación por índice.

## Fuera de alcance
- Implementación de índices concretos por modelo.

## Dependencias
- `T-0506` cerrada.

## Criterios de aceptación
- [x] Convenciones de índices documentadas.
- [x] Regla de documentación por índice definida.

## Validaciones
- Consistencia con estrategia multi-tenant del proyecto.

## Pruebas
- Revisión documental de casos de filtros comunes.

## Riesgos
- Sin convención, aumenta riesgo de degradación de performance y deuda técnica.

## Documentación a actualizar
- `docs/02-architecture/27-prisma-convenciones-indices.md`

## Evidencia documental
- `docs/02-architecture/27-prisma-convenciones-indices.md`

## Pendientes no resueltos
- Ninguno.
