# T-0515 - Crear modelo UserRole

## Metadatos
- ID: `T-0515`
- Fase: `Fase 5`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear el modelo pivote `UserRole` para asignación de roles a usuarios.

## Alcance
- Definir PK compuesta (`userId`, `roleId`).
- Definir relaciones con `User` y `Role`.
- Definir índices base para consulta por rol.

## Fuera de alcance
- Lógica de autorización en backend (`Fase 6+`).

## Dependencias
- `T-0514` cerrada.

## Criterios de aceptación
- [x] Modelo `UserRole` implementado.
- [x] PK compuesta definida.
- [x] Relaciones explícitas y timestamps definidos.

## Validaciones
- `prisma validate` sin errores.

## Pruebas
- `db:generate` exitoso.

## Riesgos
- Sin pivote `UserRole`, no se puede cerrar RBAC operativo.

## Documentación a actualizar
- `docs/02-architecture/31-prisma-modelos-foundation-rbac-auditoria-config.md`
- `prisma/schema.prisma`

## Evidencia documental
- `prisma/schema.prisma`

## Pendientes no resueltos
- Ninguno.
