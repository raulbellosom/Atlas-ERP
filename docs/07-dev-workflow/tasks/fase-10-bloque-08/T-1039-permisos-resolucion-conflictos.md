# T-1039 - Implementar permisos para resolución de conflictos

## Metadatos
- ID: `T-1039`
- Fase: `Fase 10`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Alcance
Control de permisos en desktop para acciones de resolución:

- Módulo `conflictPermissions.js` con decisión de acceso por sesión.
- Roles permitidos por defecto: `admin`, `owner`, `superadmin`.
- Permisos alternos aceptados: `sync.conflicts.resolve`, `sync:conflicts:resolve`, `sync:resolve`, `admin:full`.
- `ConflictDetailPanel` deshabilita acciones sin permiso y muestra mensaje de acceso.
- `SyncCenterTabs` muestra aviso contextual cuando no hay permiso de resolución.

## Criterios de aceptación
- [x] Un usuario sin sesión o sin permiso no puede ejecutar acciones de resolución.
- [x] Un usuario con rol/permiso válido sí puede ejecutar acciones.
- [x] La UI informa claramente el motivo cuando no hay acceso.
- [x] Build desktop OK.
