# Modelos Foundation RBAC, Auditoría y Configuración

## Task de origen
- `T-0515` a `T-0519`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Alineación de diseño
- `docs/03-domain-blueprints/core-platform.md`
- `docs/03-domain-blueprints/blueprint-tecnico-auditoria.md`
- `docs/03-domain-blueprints/blueprint-tecnico-adjuntos.md`
- `docs/08-codex/agents/prisma-data-agent.md`
- `docs/08-codex/skills/audit-skill.md`

## Modelos implementados
- `UserRole`
- `RolePermission`
- `AuditLog`
- `Attachment`
- `Setting`

## Criterios aplicados
- Relaciones explícitas con `@relation` y políticas de borrado.
- Índices por patrones de consulta frecuentes.
- Convención `createdAt` / `updatedAt` en modelos persistentes.
- Soft delete en `Attachment`.
- Scope multi-tenant en modelos que corresponden a organización.

## Notas importantes
- `AuditLog` se modela como inmutable a nivel de aplicación; el schema mantiene `updatedAt` por convención técnica global.
- `Setting` permite scope global (`organizationId = null`) y scope por organización.
- La unicidad global de `Setting` con `organizationId = null` se controla en capa de servicio.

## Siguientes dependencias
- `T-0520+`: feature flags, sync y demás modelos foundation.
- `T-0530`: migración inicial foundation.
