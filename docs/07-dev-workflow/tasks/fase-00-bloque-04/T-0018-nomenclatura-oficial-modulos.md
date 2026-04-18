# T-0018 - Definir nomenclatura oficial de módulos

## Metadatos
- ID: `T-0018`
- Fase: `Fase 0`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir nomenclatura oficial de módulos para mantener consistencia entre documentación, arquitectura y código.

## Alcance
- Documentar regla de nombre canónico, visible y técnico.
- Documentar módulos actuales y futuros con convención oficial.
- Definir restricciones de nomenclatura.

## Fuera de alcance
- Renombrado técnico de carpetas existentes.
- Refactor de nombres en código no implementado aún.

## Dependencias
- `T-0017` cerrada.

## Criterios de aceptación
- [x] Convención de nomenclatura de módulos documentada.
- [x] Catálogo de módulos actuales/futuros incluido.
- [x] Restricciones de uso definidas.

## Validaciones
- Consistencia con estrategia modular y backlog.
- Consistencia con idioma/codificación oficial del proyecto.

## Pruebas
- Prueba documental de coherencia entre nombres canónicos y técnicos.

## Riesgos
- Convención ambigua puede generar incoherencia entre repositorio, rutas y documentación.

## Documentación a actualizar
- `docs/04-modules/02-nomenclatura-oficial-modulos.md`
- `docs/00-canon/02_modular_strategy.md`

## Decisiones clave
- Nombre canónico en PascalCase y nombre técnico de carpeta en kebab-case.
- Nombre visible separado del nombre técnico cuando aplique UX/localización.

## Evidencia documental
- `docs/04-modules/02-nomenclatura-oficial-modulos.md`

## Pendientes para la siguiente task
- Definir nomenclatura de entidades y tablas (`T-0019`).

