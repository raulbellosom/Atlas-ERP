# Decisión Oficial: Modular Monolith

## ID de decisión
- Task origen: `T-0012`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Decisión
AtlasERP adopta **modular monolith** como arquitectura base para v1.

## Justificación
- Permite crecimiento por módulos con menor complejidad operativa inicial.
- Favorece entrega incremental de plataforma + dominio financiero.
- Mantiene límites de dominio sin costo de microservicios tempranos.

## Implicaciones
- Cada módulo debe tener ownership, límites claros y contratos explícitos.
- Las integraciones entre módulos deben ser controladas y auditables.
- La separación física en servicios solo se evalúa después de madurez de v1.

## Restricciones
- No introducir microservicios como estrategia base antes de cerrar governance y foundation.

