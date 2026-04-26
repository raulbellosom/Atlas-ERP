# Decisión Oficial: Servidor como Source of Truth

## ID de decisión
- Task origen: `T-0013`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Decisión
El **servidor** es la fuente oficial de verdad para AtlasERP.

## Justificación
- Garantiza integridad de datos en escenarios web, desktop y offline parcial.
- Permite validación centralizada de reglas de dominio y permisos.
- Soporta auditoría uniforme de operaciones críticas.

## Implicaciones
- Datos offline/local no se consideran oficiales hasta confirmación del backend.
- SQLite local funciona como capa auxiliar para cola, caché y borradores.
- Los conflictos de sincronización requieren resolución explícita.

## Restricciones
- No promover modelos de autoridad distribuida por cliente en v1.

