# Security and Audit

## Carácter no negociable
Toda operación sensible de AtlasERP debe estar protegida por permisos y dejar evidencia auditable.

## Reglas
- Autenticación centralizada.
- Roles y permisos por módulo y acción.
- Bitácora de cambios para operaciones críticas.
- No hard delete para registros financieros importantes.
- Registro de origen de operación:
  - server
  - desktop
  - web-offline

## Auditoría mínima
Toda operación crítica debe guardar:
- actor
- fecha
- acción
- entidad
- antes / después si aplica
- origen

## Criterio de cumplimiento
Una funcionalidad crítica no pasa a estado cerrada sin eventos de auditoría verificables.

## Referencias de política
- `docs/06-security/00-politica-feature-flags.md`
- `docs/06-security/01-politica-soft-delete.md`
- `docs/06-security/02-politica-archivos-adjuntos.md`

