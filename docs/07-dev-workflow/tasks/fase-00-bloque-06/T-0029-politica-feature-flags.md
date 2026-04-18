# T-0029 - Definir política de feature flags

## Metadatos
- ID: `T-0029`
- Fase: `Fase 0`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir reglas de gobierno para el uso de feature flags en AtlasERP.

## Alcance
- Definir principios de uso seguro y reversible.
- Definir reglas de owner, revisión y retiro.
- Definir restricciones de mal uso.

## Fuera de alcance
- Implementación técnica de sistema de flags.
- Tablero operativo de flags por entorno.

## Dependencias
- `T-0028` cerrada.

## Criterios de aceptación
- [x] Política de feature flags documentada.
- [x] Reglas de gobierno definidas.
- [x] Restricciones de uso documentadas.

## Validaciones
- Consistencia con seguridad/auditoría.
- Consistencia con estrategia modular y despliegues controlados.

## Pruebas
- Prueba documental de trazabilidad con módulos core.

## Riesgos
- Sin gobierno de flags, hay riesgo de complejidad oculta y deuda permanente.

## Documentación a actualizar
- `docs/06-security/00-politica-feature-flags.md`
- `docs/06-security/README.md`

## Decisiones clave
- Flags sensibles inician en `off`.
- Toda flag requiere owner y criterio de retiro.

## Evidencia documental
- `docs/06-security/00-politica-feature-flags.md`

## Pendientes para la siguiente task
- Definir política de soft delete (`T-0030`).

