# T-0516 - Crear modelo RolePermission

## Metadatos
- ID: `T-0516`
- Fase: `Fase 5`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear el modelo pivote `RolePermission` para mapear permisos por rol.

## Alcance
- Definir PK compuesta (`roleId`, `permissionId`).
- Definir relaciones con `Role` y `Permission`.
- Definir índice base para consulta por permiso.

## Fuera de alcance
- Catálogo final de permisos por módulo (`T-0534+`).

## Dependencias
- `T-0515` cerrada.

## Criterios de aceptación
- [x] Modelo `RolePermission` implementado.
- [x] PK compuesta definida.
- [x] Relaciones y timestamps definidos.

## Validaciones
- `prisma validate` sin errores.

## Pruebas
- `db:generate` exitoso.

## Riesgos
- Sin pivote `RolePermission`, no existe RBAC completo en datos.

## Documentación a actualizar
- `docs/02-architecture/31-prisma-modelos-foundation-rbac-auditoria-config.md`
- `prisma/schema.prisma`

## Evidencia documental
- `prisma/schema.prisma`

## Pendientes no resueltos
- Ninguno.
