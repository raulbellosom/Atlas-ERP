# T-0013 - Definir decisión oficial de servidor como source of truth

## Metadatos
- ID: `T-0013`
- Fase: `Fase 0`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Formalizar que el servidor es la autoridad oficial de datos en AtlasERP.

## Alcance
- Documentar decisión oficial de source of truth.
- Definir implicaciones para offline/sync y validación de backend.

## Fuera de alcance
- Implementación de validaciones específicas por entidad.
- Implementación de endpoints de sincronización.

## Dependencias
- `T-0012` cerrada.

## Criterios de aceptación
- [x] Decisión documentada de forma explícita.
- [x] Implicaciones de uso local documentadas.
- [x] Restricciones de autoridad distribuida documentadas.

## Validaciones
- Consistencia con principios de arquitectura y sync.
- Consistencia con política offline parcial.

## Pruebas
- Prueba documental de consistencia entre arquitectura y sync.

## Riesgos
- Ambigüedad de autoridad de datos puede generar inconsistencias operativas.

## Documentación a actualizar
- `docs/02-architecture/03-decision-source-of-truth-servidor.md`
- `docs/02-architecture/README.md`

## Decisiones clave
- Servidor ratificado como autoridad oficial.
- SQLite local permanece como capa auxiliar, no oficial.

## Evidencia documental
- `docs/02-architecture/03-decision-source-of-truth-servidor.md`
- `docs/00-canon/03_sync_principles.md`

## Pendientes para la siguiente task
- Definir política de soporte offline (`T-0014`).

