# T-0021 - Definir nomenclatura de endpoints backend

## Metadatos
- ID: `T-0021`
- Fase: `Fase 0`
- Bloque: `Bloque 5`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir convención oficial de rutas backend para consistencia de API y mantenibilidad.

## Alcance
- Documentar prefijo, formato y estructura de endpoints.
- Definir patrón para CRUD y acciones no CRUD.
- Definir restricciones de naming.

## Fuera de alcance
- Implementación de endpoints reales.
- Política de versionado mayor de API más allá de `v1`.

## Dependencias
- `T-0020` cerrada.

## Criterios de aceptación
- [x] Convención de endpoints backend documentada.
- [x] Estructura estándar y ejemplos definidos.
- [x] Restricciones de naming definidas.

## Validaciones
- Consistencia con stack backend y arquitectura modular.
- Consistencia con nomenclatura de módulos/rutas frontend.

## Pruebas
- Prueba documental de coherencia de paths.

## Riesgos
- APIs sin convención uniforme incrementan deuda técnica y errores de integración.

## Documentación a actualizar
- `docs/02-architecture/04-nomenclatura-endpoints-backend.md`
- `docs/02-architecture/README.md`

## Decisiones clave
- Prefijo `/api/v1`.
- Segmentos en kebab-case y recursos en plural.

## Evidencia documental
- `docs/02-architecture/04-nomenclatura-endpoints-backend.md`

## Pendientes para la siguiente task
- Definir naming de componentes UI (`T-0022`).

