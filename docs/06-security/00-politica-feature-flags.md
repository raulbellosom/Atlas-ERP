# Política de Feature Flags

## ID de política
- Task origen: `T-0029`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir el uso gobernado de feature flags para liberar capacidades de forma controlada y reversible.

## Principios
- Seguridad por defecto: flags sensibles inician en `off`.
- Trazabilidad: toda activación/desactivación crítica debe auditarse.
- Reversibilidad: cada flag debe permitir rollback rápido.
- Alcance explícito: global, por organización, por entorno o por grupo controlado.

## Reglas de gobierno
- Cada flag debe tener:
  - nombre estable
  - descripción funcional
  - owner técnico/funcional
  - criterio de retiro
  - fecha objetivo de revisión
- Flags temporales deben eliminarse tras estabilización.

## Restricciones
- No usar feature flags para ocultar deuda técnica permanente.
- No introducir flags sin owner y sin criterio de retiro.

