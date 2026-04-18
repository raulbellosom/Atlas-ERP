# T-0830 - Configurar permisos visuales por módulo y acción

## Metadatos
- ID: `T-0830`
- Fase: `Fase 8`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `FrontendWebAgent`

## Alcance
- `src/hooks/usePermissions.js`:
  - Lee `user.permissions` (array de strings) desde el auth store.
  - `hasAll(...perms)`: true si tiene TODOS los permisos indicados.
  - `hasAny(...perms)`: true si tiene AL MENOS UNO.
  - `isAdmin`: true si `user.role === "OWNER" || "ADMIN"` (fallback hasta que los permisos granulares estén disponibles).
- `src/components/ui/PermissionGate.jsx`:
  - Props: `require`, `anyOf`, `adminOnly`, `fallback` (default `null`).
  - Wrapper declarativo para ocultar/mostrar UI según permisos.

## Criterios de aceptacion
- [x] `usePermissions` y `PermissionGate` exportados.
- [x] Funciona con array vacío (usuario sin permisos).
- [x] lint + build OK.
