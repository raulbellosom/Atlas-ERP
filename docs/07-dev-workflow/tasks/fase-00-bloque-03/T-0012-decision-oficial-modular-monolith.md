# T-0012 - Definir decisión oficial de modular monolith

## Metadatos
- ID: `T-0012`
- Fase: `Fase 0`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Ratificar modular monolith como arquitectura base de AtlasERP v1.

## Alcance
- Documentar decisión oficial de modular monolith.
- Definir beneficios, implicaciones y restricciones.

## Fuera de alcance
- Diseño detallado de límites de cada módulo en código.
- Estrategia de extracción futura a microservicios.

## Dependencias
- `T-0011` cerrada.

## Criterios de aceptación
- [x] Decisión documentada y aprobada.
- [x] Restricción explícita contra microservicios tempranos.
- [x] Trazabilidad con principios de arquitectura.

## Validaciones
- Consistencia con `docs/00-canon/01_architecture_principles.md`.
- Consistencia con backlog fase 0.

## Pruebas
- Prueba documental de consistencia entre decisión y canon.

## Riesgos
- Sin límites de arquitectura, la evolución modular puede fragmentarse prematuramente.

## Documentación a actualizar
- `docs/02-architecture/02-decision-modular-monolith.md`
- `docs/02-architecture/README.md`

## Decisiones clave
- Modular monolith es el patrón oficial para v1.
- Microservicios tempranos quedan fuera salvo excepción formal.

## Evidencia documental
- `docs/02-architecture/02-decision-modular-monolith.md`
- `docs/00-canon/01_architecture_principles.md`

## Pendientes para la siguiente task
- Definir servidor como source of truth (`T-0013`).

