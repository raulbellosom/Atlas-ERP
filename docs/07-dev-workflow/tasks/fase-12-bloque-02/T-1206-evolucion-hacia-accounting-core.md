# T-1206 - Definir evolución futura hacia Accounting Core

## Metadatos
- ID: `T-1206`
- Fase: `Fase 12`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de actualización: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Objetivo
Documentar en el blueprint la estrategia de transición y coexistencia entre Financial Operations Core (capa operativa de tesorería, v1) y el futuro Accounting Core (capa normativa-contable, fase futura). El objetivo es dejar trazadas las decisiones de diseño que faciliten la evolución sin reescribir el módulo actual.

## Alcance
- Declarar la separación conceptual entre capa operativa (tesorería, movimientos manuales) y capa normativa (contabilidad por partida doble, plan de cuentas).
- Documentar qué entidades de Financial Operations Core alimentarán Accounting Core en el futuro.
- Establecer lineamientos de IDs y trazabilidad para facilitar la vinculación futura.
- Declarar que Financial Operations Core es autónomo en v1: no requiere Accounting Core para funcionar.
- Identificar los puntos de extensión del diseño actual que Accounting Core utilizará.

## Fuera de alcance
- No implementa Accounting Core ni ninguna lógica contable.
- No define el plan de cuentas ni asientos contables.
- No crea código ni modelos relacionados con contabilidad.
- No define la fecha ni el alcance exacto de Accounting Core.

## Dependencias
- `T-1201` (alcance v1): la estrategia de evolución parte del alcance actual declarado.
- `T-1202` (fuera de alcance): Accounting Core está declarado como fuera de alcance v1; esta task documenta cómo se llegará a él.
- `T-1205` (Sync Core): la trazabilidad de sincronización también será relevante para Accounting Core.

## Criterios de aceptación
- [x] Blueprint actualizado con estrategia de transición clara hacia Accounting Core.
- [x] Separación entre capa operativa y capa normativa-contable queda explícita.
- [x] Se documenta compatibilidad futura y lineamientos de IDs/trazabilidad.
- [x] El módulo actual queda declarado como autónomo en v1.
- [x] Se identifican los puntos de extensión sin comprometer el diseño actual.

## Validaciones
- Revisar que los puntos de extensión declarados no generan deuda técnica en el diseño de v1.
- Confirmar que la separación operativo/normativo es consistente con la arquitectura modular del canon.
- Validar encoding UTF-8 sin mojibake.

## Pruebas
- Prueba de no-dependencia: el módulo Financial Operations Core en v1 no importa ni requiere ningún módulo de Accounting Core para compilar o ejecutar.
- Prueba de documentación: la estrategia de transición puede leerse de forma autónoma y da lineamientos accionables para la fase de Accounting Core.

## Riesgos
- **Over-engineering anticipado**: diseñar demasiados puntos de extensión puede complicar la implementación de v1. Mitigación: los puntos de extensión son solo campos opcionales y anotaciones en el blueprint, no código adicional.
- **Incompatibilidad futura**: si los modelos actuales tienen diseño incompatible con contabilidad por partida doble, la migración será costosa. Mitigación: declarar campos de referencia contable como `nullable` desde el inicio.

## Documentación a actualizar
- `docs/03-domain-blueprints/financial-operations-core.md` — sección "Evolución hacia Accounting Core".

## Decisiones clave
- **Autonomía total de v1**: Financial Operations Core opera completamente sin Accounting Core. No hay dependencia ni integración en v1.
- **Campo `externalAccountingRef` nullable**: los modelos de movimiento y cuenta tienen un campo de referencia contable externa opcional (nullable) que Accounting Core usará en el futuro para vincular asientos.
- **Trazabilidad por UUID**: el UUID de cada entidad financiera será la clave de vinculación con Accounting Core, sin necesidad de migración de IDs.

## Evidencia documental
- `docs/03-domain-blueprints/financial-operations-core.md` sección "Evolución hacia Accounting Core".

## Pendientes para la siguiente task
- `T-1207` inicia el modelado Prisma, comenzando con `BankAccount`. El diseño debe respetar los lineamientos de trazabilidad declarados en T-1205 y T-1206.

## Pendientes no resueltos
- Ninguno. El alcance de Accounting Core se definirá en su propia fase.
