# T-0019 - Definir nomenclatura de entidades y tablas

## Metadatos
- ID: `T-0019`
- Fase: `Fase 0`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Establecer una convención uniforme para nombres de entidades de dominio y tablas relacionales.

## Alcance
- Definir convención para entidades y propiedades.
- Definir convención para tablas, llaves y campos temporales.
- Definir restricciones de claridad y consistencia.

## Fuera de alcance
- Implementación de linting automático de nombres.
- Migración de esquemas existentes.

## Dependencias
- `T-0018` cerrada.

## Criterios de aceptación
- [x] Convención de entidades y tablas documentada.
- [x] Reglas de llaves y campos base definidas.
- [x] Restricciones de nomenclatura definidas.

## Validaciones
- Consistencia con estrategia modular y ownership de datos.
- Consistencia con stack y práctica esperada en Prisma/PostgreSQL.

## Pruebas
- Prueba documental de alineación con modelo de datos esperado.

## Riesgos
- Nomenclatura inconsistente complica mantenibilidad y trazabilidad de dominio.

## Documentación a actualizar
- `docs/04-modules/03-nomenclatura-entidades-tablas.md`
- `docs/00-canon/02_modular_strategy.md`

## Decisiones clave
- Entidades en PascalCase singular.
- Tablas en snake_case singular con convenciones estándar de llaves.

## Evidencia documental
- `docs/04-modules/03-nomenclatura-entidades-tablas.md`

## Pendientes para la siguiente task
- Definir nomenclatura de rutas frontend (`T-0020`).

