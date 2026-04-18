# T-1044 - Implementar pruebas de rechazo por regla de negocio

## Metadatos
- ID: `T-1044`
- Fase: `Fase 10`
- Bloque: `Bloque 9`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Pruebas de reglas de negocio para rechazar/elevar conflictos:

- `getAutoResolveStrategy(..., 'delete')` devuelve siempre `none`.
- `isDangerousMerge` marca entidades financieras como peligrosas.
- Caso de entidad no financiera como control negativo.

## Criterios de aceptación
- [x] Existe test de política `delete -> none`.
- [x] Existe test de detección de merges peligrosos financieros.
- [x] Suite `@atlasrep/api test:sync-core` en verde.
