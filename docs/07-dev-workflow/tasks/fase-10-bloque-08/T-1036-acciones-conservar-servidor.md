# T-1036 - Implementar acciones de conservar servidor

## Metadatos
- ID: `T-1036`
- Fase: `Fase 10`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Resolver conflicto con acción **Conservar servidor**:

- Acción `KEEP_SERVER` en `ConflictDetailPanel`.
- Rechaza/cancela el item local conflictivo (`approvalStatus=rejected`, `status=canceled`).
- Registra razón de resolución explícita.
- Intenta enviar resolución a backend cuando existe `conflictId`.

## Criterios de aceptación
- [x] Existe botón de acción "Conservar servidor".
- [x] La acción elimina el cambio local conflictivo de la cola activa.
- [x] Se conserva trazabilidad de motivo en `approvalReason`.
- [x] Build desktop OK.
