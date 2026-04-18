# T-0016 - Definir política de ownership de datos

## Metadatos
- ID: `T-0016`
- Fase: `Fase 0`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir la política oficial de ownership de datos para controlar responsabilidad por entidad y evitar conflictos de escritura entre módulos.

## Alcance
- Documentar política oficial de ownership de datos.
- Definir reglas obligatorias por entidad.
- Definir restricciones explícitas de escritura transversal.

## Fuera de alcance
- Implementación de validaciones de ownership en código.
- Matriz completa por entidad de todos los módulos.

## Dependencias
- `T-0015` cerrada.

## Criterios de aceptación
- [x] Política de ownership creada.
- [x] Matriz mínima por entidad definida.
- [x] Restricciones de creación/edición documentadas.

## Validaciones
- Consistencia con canon de data ownership.
- Consistencia con modular strategy y source of truth.

## Pruebas
- Prueba documental de trazabilidad con `docs/00-canon/04_data_ownership.md`.

## Riesgos
- Sin ownership claro, aumenta riesgo de inconsistencia y acoplamiento indebido.

## Documentación a actualizar
- `docs/04-modules/00-politica-ownership-datos.md`
- `docs/00-canon/04_data_ownership.md`

## Decisiones clave
- Cada entidad tiene módulo dueño único.
- Módulos no dueños no redefinen entidades fuente.

## Evidencia documental
- `docs/04-modules/00-politica-ownership-datos.md`

## Pendientes para la siguiente task
- Definir estrategia de crecimiento por módulos (`T-0017`).

