# T-0023 - Definir convención de naming para servicios y providers

## Metadatos
- ID: `T-0023`
- Fase: `Fase 0`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir convención oficial de naming para servicios y providers en backend.

## Alcance
- Definir nombres de clases, archivos y tokens.
- Definir patrón recomendado de nombres de métodos.
- Definir restricciones para evitar ambigüedad.

## Fuera de alcance
- Refactor de código backend existente.
- Definición de módulos backend concretos.

## Dependencias
- `T-0022` cerrada.

## Criterios de aceptación
- [x] Convención de naming de services/providers documentada.
- [x] Reglas de archivo y token documentadas.
- [x] Restricciones de responsabilidad y naming ambiguo definidas.

## Validaciones
- Consistencia con principios de backend modular.
- Consistencia con arquitectura y stack oficial.

## Pruebas
- Prueba documental de claridad de naming y contratos.

## Riesgos
- Naming inconsistente de servicios/providers complica DI, testing y mantenimiento.

## Documentación a actualizar
- `docs/02-architecture/06-naming-services-providers.md`
- `docs/00-canon/01_architecture_principles.md`

## Decisiones clave
- Sufijos oficiales `Service` y `Provider`.
- Archivos `.service.ts` y `.provider.ts` en kebab-case.

## Evidencia documental
- `docs/02-architecture/06-naming-services-providers.md`

## Pendientes para la siguiente task
- Definir naming de prompts/skills/agents (`T-0024`).

