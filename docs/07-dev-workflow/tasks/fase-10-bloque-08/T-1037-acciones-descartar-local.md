# T-1037 - Implementar acciones de descartar local

## Metadatos
- ID: `T-1037`
- Fase: `Fase 10`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Resolver conflicto con acción **Descartar local**:

- Acción `DISCARD_LOCAL` en el panel.
- Cancela explícitamente el item local (sin reintento).
- Registra razón diferenciada para distinguirla de `KEEP_SERVER`.
- Dispara resolución de backend si hay `conflictId`.

## Criterios de aceptación
- [x] Existe botón de acción "Descartar local".
- [x] El item conflictivo queda cancelado sin nuevo requeue.
- [x] El motivo de resolución queda trazable y distinto semánticamente.
- [x] Build desktop OK.
