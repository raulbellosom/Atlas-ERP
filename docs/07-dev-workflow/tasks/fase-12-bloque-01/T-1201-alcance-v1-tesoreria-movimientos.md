# T-1201 - Definir alcance exacto de v1 de Tesorería y Movimientos

## Metadatos
- ID: `T-1201`
- Fase: `Fase 12`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Objetivo
Declarar de forma explícita e inequívoca qué capacidades están incluidas en la v1 del módulo Financial Operations Core, funcionando como contrato de entrega para toda la Fase 12 y 13. Sin esta definición, cada tarea de implementación puede interpretar el alcance de manera diferente.

## Alcance
- Definir la lista exacta de capacidades de v1 del módulo:
  - Cuentas bancarias (CRUD completo, multi-divisa, multi-cuenta por organización).
  - Movimientos financieros manuales (ingresos, egresos, ajustes).
  - Transferencias internas entre cuentas de la misma organización.
  - Adjuntos de movimientos (comprobantes digitales vía `Attachment` de Core Platform).
  - Snapshots de saldo (balance por cuenta en un momento dado).
  - Conciliación básica por sesión (marcar movimientos como conciliados).
  - Receivables y Payables en modo "lite" (registro de cuentas por cobrar/pagar sin contabilidad completa).
- Documentar cada capacidad en el blueprint con descripción de una línea.
- Establecer el criterio de "v1 completo" para Release Candidate.

## Fuera de alcance
- No incluye definición de las entidades de base de datos (esa es `T-1203`).
- No incluye la lista de capacidades excluidas (esa es `T-1202`).
- No cubre integraciones bancarias automáticas ni importación de estados de cuenta.
- No incluye contabilidad por partida doble ni plan de cuentas.

## Dependencias
- `T-1200`: el blueprint refinado debe existir como documento base antes de declarar el alcance.
- `docs/01-product/01-alcance-v1.md`: el alcance del módulo debe ser consistente con el alcance general de producto.

## Criterios de aceptación
- [x] La sección de alcance v1 está explícita en el blueprint con lista de capacidades.
- [x] No hay ambigüedad sobre los entregables funcionales de v1.
- [x] Cada capacidad tiene descripción de propósito en una línea.
- [x] El alcance está en consistencia con `docs/01-product/01-alcance-v1.md`.

## Validaciones
- Comparar la lista de capacidades contra el catálogo maestro de tasks (Fases 12-14) para confirmar que cada capacidad tiene tasks de implementación asignadas.
- Revisar que ninguna capacidad declarada como "en alcance" contradice la política de Fase futura en el canon.
- Validar encoding UTF-8 sin mojibake.

## Pruebas
- Prueba de completitud: por cada capacidad declarada en v1 existe al menos una task en Fase 12 o 13 que la implementa.
- Prueba de no-ambigüedad: un desarrollador nuevo puede leer el alcance y determinar sin consulta adicional si una feature concreta está o no incluida.

## Riesgos
- **Scope creep durante implementación**: si el alcance no es suficientemente específico, las tasks de Fase 13 (backend) pueden asumir features adicionales. Mitigación: mantener el alcance como referencia obligatoria en cada task de Fase 13.
- **Omisión de capacidad necesaria**: declarar v1 sin una capacidad que el flujo mínimo viable requiere. Mitigación: validar contra el caso de uso mínimo de tesorería operativa.

## Documentación a actualizar
- `docs/03-domain-blueprints/financial-operations-core.md` — sección "Alcance v1".

## Decisiones clave
- **Receivables/Payables en modo "lite"**: se incluyen en v1 para tener visibilidad de flujo de efectivo, pero sin contabilidad completa. La versión "full" queda en scope de Fase futura (Accounting Core).
- **Conciliación básica**: se incluye como sesión manual sin integración bancaria automática para cumplir el flujo mínimo de tesorería.

## Evidencia documental
- `docs/03-domain-blueprints/financial-operations-core.md` sección "Alcance v1".

## Pendientes para la siguiente task
- `T-1202` debe declarar explícitamente las capacidades excluidas para blindar el alcance definido aquí.

## Pendientes no resueltos
- Ninguno.
