# T-0517 - Crear modelo AuditLog

## Metadatos
- ID: `T-0517`
- Fase: `Fase 5`
- Bloque: `Bloque 4`
- Estado: `closed`
- Fecha de cierre: `2026-04-13`
- Agente responsable: `PrismaDataAgent`

## Objetivo
Crear el modelo `AuditLog` para trazabilidad de acciones críticas del sistema.

## Alcance
- Definir campos de actor, acción, entidad afectada y origen.
- Definir campos `before`/`after`/`metadata` como JSON.
- Definir relación con `Organization` y actor `User` opcional.

## Fuera de alcance
- Implementación de `AuditService` en backend (`Fase 6+`).

## Dependencias
- `T-0516` cerrada.

## Criterios de aceptación
- [x] Modelo `AuditLog` implementado.
- [x] Índices de consulta por organización, entidad, acción y origen.
- [x] Compatibilidad con blueprint técnico de auditoría.

## Validaciones
- `prisma validate` sin errores.

## Pruebas
- `db:generate` y `db:seed` exitosos.

## Riesgos
- Sin `AuditLog` no se puede cumplir auditoría mínima de operaciones críticas.

## Documentación a actualizar
- `docs/02-architecture/31-prisma-modelos-foundation-rbac-auditoria-config.md`
- `prisma/schema.prisma`

## Evidencia documental
- `prisma/schema.prisma`

## Pendientes no resueltos
- Ninguno.
