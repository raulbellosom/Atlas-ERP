# T-0034 - Definir política de compatibilidad entre módulos

## Metadatos
- ID: `T-0034`
- Fase: `Fase 0`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir reglas para mantener compatibilidad entre módulos al evolucionar la plataforma.

## Alcance
- Documentar política de compatibilidad.
- Definir criterios de contratos y transición.
- Definir restricciones de acoplamiento.

## Fuera de alcance
- Implementación técnica de versionado de contratos.
- Plan de migración detallado por módulo.

## Dependencias
- `T-0033` cerrada.

## Criterios de aceptación
- [x] Política de compatibilidad documentada.
- [x] Criterios de transición para cambios incompatibles definidos.
- [x] Restricciones de acoplamiento definidas.

## Validaciones
- Consistencia con estrategia modular y ownership.
- Consistencia con backlog de módulos futuros.

## Pruebas
- Prueba documental de coherencia de contratos entre módulos.

## Riesgos
- Sin compatibilidad explícita, cambios transversales pueden romper módulos dependientes.

## Documentación a actualizar
- `docs/04-modules/05-politica-compatibilidad-modulos.md`
- `docs/04-modules/README.md`
- `docs/00-canon/02_modular_strategy.md`

## Decisiones clave
- Cambios incompatibles requieren transición/versionado documentado.
- Prohibido acoplamiento implícito entre módulos.

## Evidencia documental
- `docs/04-modules/05-politica-compatibilidad-modulos.md`

## Pendientes para la siguiente task
- Definir criterios de task terminada (`T-0035`).

## Pendientes no resueltos
- Ninguno.

