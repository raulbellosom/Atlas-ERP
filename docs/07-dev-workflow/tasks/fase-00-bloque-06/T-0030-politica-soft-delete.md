# T-0030 - Definir política de soft delete

## Metadatos
- ID: `T-0030`
- Fase: `Fase 0`
- Bloque: `Bloque 6`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir política oficial de soft delete para preservar trazabilidad en registros sensibles.

## Alcance
- Definir principios, reglas y restricciones de soft delete.
- Definir lineamientos de restauración y visibilidad.

## Fuera de alcance
- Implementación en esquema de base de datos.
- Implementación de endpoints de restauración.

## Dependencias
- `T-0029` cerrada.

## Criterios de aceptación
- [x] Política de soft delete documentada.
- [x] Reglas de uso y restricciones definidas.
- [x] Lineamientos de restauración documentados.

## Validaciones
- Consistencia con auditoría y seguridad.
- Consistencia con políticas de datos y backend.

## Pruebas
- Prueba documental de coherencia con modelo de registros críticos.

## Riesgos
- Sin política clara, puede haber pérdida de trazabilidad o eliminación indebida.

## Documentación a actualizar
- `docs/06-security/01-politica-soft-delete.md`
- `docs/06-security/README.md`

## Decisiones clave
- Soft delete por defecto en registros críticos.
- Hard delete solo en procesos administrativos explícitos.

## Evidencia documental
- `docs/06-security/01-politica-soft-delete.md`

## Pendientes para la siguiente task
- Iniciar `T-0031` (política de archivos y adjuntos).

