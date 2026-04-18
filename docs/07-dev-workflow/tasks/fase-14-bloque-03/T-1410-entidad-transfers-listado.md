# T-1410 - Entidad Transfers: listado

## Metadatos
- ID: `T-1410`
- Fase: `Fase 14`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de actualización: `2026-04-14`
- Agente responsable: `Codex`

## Objetivo
Implementar la página de listado de transferencias entre cuentas bancarias, mostrando el historial de movimientos entre cuentas internas con sus estatus y montos.

## Alcance
- Crear página `TransfersPage` en `/finops/transfers`.
- Tabla con columnas: fecha, cuenta origen, cuenta destino, monto, moneda, estatus (badge), referencia.
- Filtros básicos: rango de fechas, cuenta origen/destino.
- Botón "Nueva transferencia" que navega al asistente de creación.
- Integración con `GET /api/v1/transfers` vía react-query.
- Estados de carga (skeleton) y vacío.

## Fuera de alcance
- Asistente de creación (eso es T-1411).
- Aprobación de transferencia (eso es T-1412).
- Detalle y rastreo de doble partida (eso es T-1413).

## Dependencias
- `T-1400`: layout FinOps disponible.
- `T-1302`: endpoint `GET /api/v1/transfers` disponible.

## Criterios de aceptación
- [x] Listado de transferencias con cuentas origen/destino visibles.
- [x] Badge de estatus por transferencia.
- [x] Filtros básicos funcionales.
- [x] `lint` ✅ · `typecheck` ✅ · UI walkthrough ✅

## Validaciones
- `pnpm --filter @atlasrep/web run lint`: sin errores.
- `pnpm --filter @atlasrep/web run typecheck`: sin errores.
- Revisión manual: transferencias demo cargan correctamente.

## Pruebas
- Listado muestra transferencias del seed con cuentas origen y destino.
- Filtrar por cuenta origen — muestra solo transferencias de esa cuenta.
- Transferencia pendiente vs. completada — badges diferenciados.

## Riesgos
- **Nombres de cuentas**: la tabla necesita los nombres de las cuentas, pero la API puede retornar solo IDs. El endpoint debe incluir los nombres en la respuesta (include de Prisma).

## Documentación a actualizar
- `apps/web/src/modules/finops/pages/TransfersPage.jsx` — archivo nuevo.
- `apps/web/src/modules/finops/hooks/useTransfers.js`.

## Decisiones clave
- **Enums mapeados a diccionarios del frontend**: consistente con el patrón del módulo.

## Evidencia documental
- `apps/web/src/modules/finops/pages/TransfersPage.jsx`
- `apps/web/src/modules/finops/hooks/useTransfers.js`

## Pendientes para la siguiente task
- `T-1411` implementa el asistente de creación de transferencias.

## Pendientes no resueltos
- Ninguno.
