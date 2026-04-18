# T-0003 - Definir alcance de la plataforma v1

## Metadatos
- ID: `T-0003`
- Fase: `Fase 0`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir de manera explícita qué entra en v1 para priorizar ejecución y evitar expansión no controlada.

## Alcance
- Delimitar alcance funcional v1.
- Delimitar alcance técnico mínimo v1.
- Confirmar módulos núcleo previos al macro-módulo de negocio.

## Fuera de alcance
- Plan de implementación por sprint detallado.
- Detalle de historias de usuario por pantalla.

## Dependencias
- `T-0002` cerrada.

## Criterios de aceptación
- [x] Alcance funcional v1 definido.
- [x] Alcance técnico mínimo definido.
- [x] Documento de alcance v1 creado y alineado con backlog.

## Validaciones
- Revisión de consistencia con backlog maestro y roadmap inicial.
- Verificación de alineación con stack y arquitectura oficial.

## Pruebas
- Prueba documental de trazabilidad con `business-platform-master-task-catalog.md`.

## Riesgos
- Alcance mal delimitado puede introducir deuda por sobre-extensión de v1.

## Documentación a actualizar
- `docs/01-product/01-alcance-v1.md`

## Decisiones clave
- v1 incluye base de plataforma + Sync Core + Financial Operations Core.
- v1 incluye web, desktop y backend con offline parcial controlado.
- Se confirma stack oficial como parte del alcance técnico mínimo.

## Evidencia documental
- `docs/01-product/01-alcance-v1.md`
- `business-platform-master-task-catalog.md`
- `initial-roadmap.md`

## Pendientes para la siguiente task
- Definir fuera de alcance v1 (`T-0004`).

