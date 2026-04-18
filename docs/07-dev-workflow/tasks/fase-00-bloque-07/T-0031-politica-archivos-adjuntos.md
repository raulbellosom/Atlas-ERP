# T-0031 - Definir política de archivos y adjuntos

## Metadatos
- ID: `T-0031`
- Fase: `Fase 0`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir reglas oficiales para manejo de archivos y adjuntos con enfoque en seguridad y trazabilidad.

## Alcance
- Documentar política de adjuntos.
- Definir reglas de validación y almacenamiento.
- Definir restricciones de seguridad.

## Fuera de alcance
- Implementación técnica de upload/download.
- Integración antivirus o DLP.

## Dependencias
- `T-0030` cerrada.

## Criterios de aceptación
- [x] Política de archivos y adjuntos documentada.
- [x] Reglas de seguridad mínimas definidas.
- [x] Restricciones de uso definidas.

## Validaciones
- Consistencia con políticas de seguridad y auditoría.
- Consistencia con stack de almacenamiento declarado.

## Pruebas
- Prueba documental de trazabilidad con canon de seguridad.

## Riesgos
- Sin política clara hay riesgo de exposición de archivos y pérdida de trazabilidad.

## Documentación a actualizar
- `docs/06-security/02-politica-archivos-adjuntos.md`
- `docs/06-security/README.md`
- `docs/00-canon/06_security_and_audit.md`

## Decisiones clave
- Todo adjunto requiere referencia explícita a entidad.
- Se exige validación de tipo/tamaño y trazabilidad de actor/origen.

## Evidencia documental
- `docs/06-security/02-politica-archivos-adjuntos.md`

## Pendientes para la siguiente task
- Definir política de versionado de registros (`T-0032`).

## Pendientes no resueltos
- Ninguno.

