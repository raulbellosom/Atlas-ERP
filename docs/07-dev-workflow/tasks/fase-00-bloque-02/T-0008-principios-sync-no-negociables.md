# T-0008 - Definir principios de sincronización no negociables

## Metadatos
- ID: `T-0008`
- Fase: `Fase 0`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir las reglas obligatorias de sincronización para operación offline parcial segura y auditable.

## Alcance
- Consolidar principios de sync en canon.
- Definir regla crítica de confirmación por backend.
- Definir criterio de cumplimiento.

## Fuera de alcance
- Diseño técnico detallado de endpoints de sync.
- Implementación del motor de sincronización.

## Dependencias
- `T-0006` y `T-0007` cerradas.

## Criterios de aceptación
- [x] Documento canon sync actualizado con carácter no negociable.
- [x] Estados de sincronización listados.
- [x] Criterio de cumplimiento definido.

## Validaciones
- Consistencia con servidor como fuente de verdad.
- Consistencia con requisito de Sync Center.

## Pruebas
- Prueba documental de consistencia con backlog de Sync Core.

## Riesgos
- Regla de sync ambigua puede ocasionar pérdida de integridad de datos.

## Documentación a actualizar
- `docs/00-canon/03_sync_principles.md`

## Decisiones clave
- Nada offline es oficial hasta confirmación del backend.
- Se mantiene revisión explícita de diferencias.
- Sync Center se confirma como módulo obligatorio.

## Evidencia documental
- `docs/00-canon/03_sync_principles.md`

## Pendientes para la siguiente task
- Definir principios de seguridad y auditoría (`T-0009`).

