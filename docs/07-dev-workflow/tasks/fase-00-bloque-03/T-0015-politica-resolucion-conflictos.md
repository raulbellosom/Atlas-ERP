# T-0015 - Definir política de resolución de conflictos

## Metadatos
- ID: `T-0015`
- Fase: `Fase 0`
- Bloque: `Bloque 3`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir política oficial de resolución de conflictos para sincronización segura y auditable.

## Alcance
- Definir opciones mínimas de resolución.
- Definir reglas operativas de registro y auditoría.
- Definir integración obligatoria con Sync Center.

## Fuera de alcance
- Implementación de UI del Sync Center.
- Implementación de resolutores automáticos.

## Dependencias
- `T-0014` cerrada.

## Criterios de aceptación
- [x] Política de resolución de conflictos creada.
- [x] Opciones mínimas de resolución documentadas.
- [x] Reglas de auditoría e integración con Sync Center documentadas.

## Validaciones
- Consistencia con principios de sync y seguridad/auditoría.
- Consistencia con reglas maestras del proyecto.

## Pruebas
- Prueba documental de trazabilidad con canon y backlog.

## Riesgos
- Ausencia de política clara puede provocar pérdida de trazabilidad en diferencias de datos.

## Documentación a actualizar
- `docs/05-sync/01-politica-resolucion-conflictos.md`
- `docs/05-sync/README.md`

## Decisiones clave
- Resolución explícita y auditable obligatoria.
- Resolución automática solo para casos seguros y documentados.

## Evidencia documental
- `docs/05-sync/01-politica-resolucion-conflictos.md`
- `docs/00-canon/03_sync_principles.md`
- `docs/00-canon/06_security_and_audit.md`

## Pendientes para la siguiente task
- Iniciar `T-0016` (política de ownership de datos).

