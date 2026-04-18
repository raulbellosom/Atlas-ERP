# T-1202 - Definir fuera de alcance del módulo

## Metadatos
- ID: `T-1202`
- Fase: `Fase 12`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Objetivo
Declarar explícitamente qué capacidades, integraciones y funcionalidades quedan fuera del alcance de v1 del módulo Financial Operations Core. Esta declaración previene la expansión de scope durante las Fases 12-14 y evita ambigüedad en decisiones de implementación.

## Alcance
- Declarar en el blueprint la lista de exclusiones de v1.
- Agrupar exclusiones por categoría: contabilidad avanzada, integraciones externas, automatizaciones, capacidades de fases futuras.
- Para cada exclusión relevante, añadir la nota de "Fase futura" o "módulo independiente" donde corresponda.
- Establecer el límite claro entre Financial Operations Core y Accounting Core (futuro).

## Fuera de alcance de esta task
- No define qué sí está incluido (esa es `T-1201`).
- No implementa ninguna lógica ni código.
- No crea entidades ni modelos.

## Dependencias
- `T-1201`: el alcance v1 debe estar definido antes de poder declarar el fuera de alcance, ya que ambas listas son complementarias.

## Criterios de aceptación
- [x] El blueprint declara el fuera de alcance de v1 de forma explícita.
- [x] Queda claro que Accounting Core no se implementa en esta fase.
- [x] Las exclusiones incluyen: contabilidad por partida doble, plan de cuentas, integración bancaria automática, facturación electrónica, nómina, conciliación automática, multi-moneda avanzada.
- [x] Cada exclusión tiene una justificación de una línea o referencia a fase futura.

## Validaciones
- Revisar que cada exclusión declarada no contradice ninguna capacidad ya declarada en el alcance v1 (`T-1201`).
- Confirmar que las exclusiones son consistentes con el canon (`docs/00-canon/`) sobre modularidad.
- Verificar encoding UTF-8 sin mojibake.

## Pruebas
- Prueba de no-contradicción: ningún ítem del fuera de alcance aparece también en el alcance v1.
- Prueba de completitud: las capacidades excluidas cubren los casos más frecuentes de scope creep en sistemas de tesorería.

## Riesgos
- **Lista incompleta**: si no se declaran explícitamente capacidades comunes de ERP financiero, un desarrollador puede asumir que están implícitamente incluidas. Mitigación: cubrir al menos las categorías de contabilidad, nómina, facturación, integración bancaria y reportes fiscales.

## Documentación a actualizar
- `docs/03-domain-blueprints/financial-operations-core.md` — sección "Fuera de alcance v1".

## Decisiones clave
- **Accounting Core como módulo independiente**: la decisión de separar contabilidad de tesorería es arquitectónica y fue tomada en Fase 2. Esta task refuerza esa decisión en el contexto de v1.
- **No hay integración bancaria en v1**: toda conciliación es manual. La automatización queda para una fase de integraciones futuras.

## Evidencia documental
- `docs/03-domain-blueprints/financial-operations-core.md` sección "Fuera de alcance v1".

## Pendientes para la siguiente task
- `T-1203` debe definir el catálogo de entidades de dominio que soportan las capacidades declaradas en `T-1201`.

## Pendientes no resueltos
- Ninguno.
