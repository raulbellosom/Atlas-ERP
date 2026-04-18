# T-0045 - Definir estrategia de ownership de decisiones tecnicas

## Metadatos
- ID: `T-0045`
- Fase: `Fase 0`
- Bloque: `Bloque 9`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir quien puede tomar decisiones tecnicas de cada tipo, como se registran formalmente y que mecanismo impide decisiones arbitrarias que rompan la arquitectura o el canon del proyecto.

## Alcance
- Definir niveles de decision tecnica y su proceso de aprobacion.
- Definir el mecanismo de registro formal: ADR (Architecture Decision Record).
- Definir quien puede aprobar cada nivel de decision.
- Definir el veto sobre decisiones que contradigan el canon.
- Definir responsables por area tecnica.

## Fuera de alcance
- Creacion de plantilla de ADR (se delega a Fase 3, `T-0338`).
- Creacion de carpeta de ADRs en el repositorio (se delega a Fase 3).
- Proceso detallado de PRs y reviews (cubierto en `T-0038`).

## Dependencias
- `T-0044` cerrada.
- Canon establecido (`docs/00-canon/*`).
- Politica de branches y PRs (`T-0038`).

## Criterios de aceptacion
- [x] Cuatro niveles de decision documentados con ejemplos.
- [x] Proceso de aprobacion por nivel definido.
- [x] Mecanismo ADR definido con estructura minima.
- [x] Proceso de aprobacion para decisiones de Nivel 3 documentado.
- [x] Veto sobre el canon documentado con proceso de levantamiento.
- [x] Responsables por area tecnica identificados.

## Validaciones
- Los niveles de decision son coherentes con la politica de branches y PRs (`T-0038`).
- El mecanismo de veto es suficientemente explicito para prevenir decisiones arbitrarias.

## Pruebas
- Prueba documental: verificar que los ejemplos de cada nivel son claros y no ambiguos.
- Revision de coherencia: las decisiones de Nivel 4 requieren modificar el canon, que ya esta documentado.

## Riesgos
- Sin ownership claro, las decisiones tecnicas se toman de forma inconsistente y rompen la arquitectura.
- Sin mecanismo de veto sobre el canon, decisiones individuales pueden socavar los principios base del proyecto.

## Documentacion a actualizar
- `docs/02-architecture/15-ownership-decisiones-tecnicas.md`
- `docs/02-architecture/README.md`

## Decisiones clave
- Cuatro niveles de decision: local, modulo, arquitectonico y canon.
- ADR obligatorio para decisiones de Nivel 3 y 4.
- Decisiones que contradigan el canon estan vetadas por defecto.
- La carpeta `docs/02-architecture/adr/` se crea en Fase 3.

## Evidencia documental
- `docs/02-architecture/15-ownership-decisiones-tecnicas.md`

## Pendientes para la siguiente task
- Iniciar `T-0046` (estrategia de revision de tasks generadas por IA).

## Pendientes no resueltos
- Ninguno.
