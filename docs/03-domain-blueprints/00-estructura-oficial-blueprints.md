# Estructura Oficial de Blueprints

## ID de decisión
- Task origen: `T-0027`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir cómo se organizan y nombran los blueprints de dominio para asegurar consistencia entre módulos actuales y futuros.

## Tipos de blueprint
- Blueprint de plataforma núcleo.
- Blueprint de módulo core transversal.
- Blueprint de módulo de negocio activo.
- Blueprint de módulo futuro.

## Convención de archivos
- Nombre de archivo: `kebab-case`.
- Sufijo recomendado por tipo:
  - `*-core.md`
  - `*-future.md`
  - `core-platform.md`
- Un blueprint por módulo/dominio principal.

## Contenido mínimo por blueprint
- propósito
- alcance
- entidades base
- relaciones clave
- relaciones futuras
- reglas de integración y límites

## Reglas de actualización
- Si cambia el alcance de módulo, actualizar blueprint en el mismo cambio.
- Si se crea módulo nuevo, debe nacer con blueprint antes de implementación técnica.
- Mantener trazabilidad hacia backlog y políticas de ownership/sync.

