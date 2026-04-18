# T-0033 - Definir política de cambios de esquema

## Metadatos
- ID: `T-0033`
- Fase: `Fase 0`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir proceso y restricciones para cambios de esquema con migraciones controladas.

## Alcance
- Documentar reglas de migración de esquema.
- Definir flujo mínimo de cambio.
- Definir restricciones de despliegue.

## Fuera de alcance
- Implementación de pipeline de migraciones.
- Validaciones automáticas de migración.

## Dependencias
- `T-0032` cerrada.

## Criterios de aceptación
- [x] Política de cambios de esquema documentada.
- [x] Flujo mínimo de cambio definido.
- [x] Restricciones de seguridad operativa definidas.

## Validaciones
- Consistencia con stack (Prisma/PostgreSQL) y modelo de governance.
- Consistencia con estrategia de versionado y seeds.

## Pruebas
- Prueba documental de coherencia con migraciones versionadas.

## Riesgos
- Cambios de esquema sin política provocan rompimientos y pérdida de control operativo.

## Documentación a actualizar
- `docs/02-architecture/09-politica-cambios-esquema.md`
- `docs/02-architecture/README.md`
- `docs/00-canon/01_architecture_principles.md`

## Decisiones clave
- Todo cambio de esquema requiere migración versionada.
- Cambios incompatibles requieren estrategia de transición documentada.

## Evidencia documental
- `docs/02-architecture/09-politica-cambios-esquema.md`

## Pendientes para la siguiente task
- Definir política de compatibilidad entre módulos (`T-0034`).

## Pendientes no resueltos
- Ninguno.

