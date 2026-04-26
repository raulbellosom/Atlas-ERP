# Política de Soporte Offline

## ID de política
- Task origen: `T-0014`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Política oficial
AtlasERP soporta **offline parcial controlado**. No se permite offline total libre.

## Reglas
- El cliente puede operar offline solo en flujos previamente autorizados.
- SQLite local se usa para cola, caché, borradores y snapshots permitidos.
- Toda operación offline debe sincronizarse posteriormente con validación de backend.
- Si una operación no está permitida offline, debe bloquearse o marcarse como pendiente de conexión.

## Criterios para permitir un flujo offline
- Riesgo de inconsistencia aceptable.
- Reglas de negocio validables en backend al sincronizar.
- Capacidad de auditoría y trazabilidad al confirmar.
- Definición explícita de conflicto y resolución cuando aplique.

## Restricciones
- No marcar datos locales como oficiales sin confirmación del servidor.
- No introducir merges automáticos en datos sensibles por defecto.

