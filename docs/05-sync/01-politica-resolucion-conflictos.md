# Política de Resolución de Conflictos

## ID de política
- Task origen: `T-0015`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Política oficial
Toda diferencia entre estado local y servidor debe generar resolución explícita y auditable.

## Opciones mínimas de resolución
- Aprobar versión local.
- Conservar versión servidor.
- Descartar cambios locales.
- Fusionar manualmente cuando aplique.

## Reglas operativas
- Los conflictos deben registrarse con contexto suficiente para revisión humana.
- Cada resolución debe guardar evidencia de actor, fecha, entidad y decisión.
- La resolución automática solo se permite en casos seguros, previamente definidos y documentados.
- En datos sensibles, la preferencia es revisión humana antes de confirmar.

## Integración con Sync Center
- El Sync Center es la superficie obligatoria para revisar y resolver conflictos.
- Debe mostrar estado, impacto y resultado de cada conflicto resuelto.

## Restricciones
- Prohibido asumir que todo conflicto puede resolverse automáticamente.
- Prohibido ocultar conflictos al usuario final operativo.

