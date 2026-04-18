# T-1042 - Implementar pruebas de conflictos de edición

## Metadatos
- ID: `T-1042`
- Fase: `Fase 10`
- Bloque: `Bloque 9`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Pruebas unitarias de motor de conflictos en backend:

- `comparePayloads` detecta conflicto y lista campos cambiados.
- `computeMinimalDiff` separa correctamente `added`, `removed` y `changed`.
- Casos con payload estructurado y cambios anidados en metadata.

## Criterios de aceptación
- [x] Hay test de conflicto positivo con `changedKeys`.
- [x] Hay test de diff mínimo con salida esperada.
- [x] Suite `@atlasrep/api test:sync-core` en verde.
