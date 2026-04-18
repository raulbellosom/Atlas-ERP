# T-0028 - Definir estrategia de seeds iniciales

## Metadatos
- ID: `T-0028`
- Fase: `Fase 0`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir estrategia de seeds para bootstrap controlado de entornos.

## Alcance
- Definir principios de seeds.
- Definir tipos de seeds y reglas operativas.
- Definir restricciones de seguridad.

## Fuera de alcance
- Implementación de scripts de seed.
- Datos de demo completos por módulo.

## Dependencias
- `T-0027` cerrada.

## Criterios de aceptación
- [x] Estrategia de seeds documentada.
- [x] Tipos de seeds definidos.
- [x] Restricciones de seguridad definidas.

## Validaciones
- Consistencia con stack y prácticas de datos.
- Consistencia con reglas de seguridad y auditoría.

## Pruebas
- Prueba documental de separación de seeds base/demo por entorno.

## Riesgos
- Seeds sin estrategia clara pueden contaminar entornos y pruebas.

## Documentación a actualizar
- `docs/02-architecture/07-estrategia-seeds-iniciales.md`
- `docs/02-architecture/README.md`

## Decisiones clave
- Seeds idempotentes y sin datos sensibles reales.
- Separación explícita base vs demo.

## Evidencia documental
- `docs/02-architecture/07-estrategia-seeds-iniciales.md`

## Pendientes para la siguiente task
- Definir política de feature flags (`T-0029`).

