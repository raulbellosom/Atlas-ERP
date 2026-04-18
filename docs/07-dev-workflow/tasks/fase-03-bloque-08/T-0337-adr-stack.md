# T-0337 - Crear ADR inicial de stack

## Metadatos
- ID: `T-0337`
- Fase: `Fase 3`
- Bloque: `Bloque 8`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `SystemArchitectAgent`

## Objetivo
Documentar formalmente el stack tecnologico oficial de AtlasERP como ADR-002, consolidando todas las decisiones de tecnologia ya tomadas en las Fases 0-3.

## Criterios de aceptación
- [x] `docs/09-adr/002-stack-tecnologico.md` creado con estado `aprobado`.
- [x] Tabla completa: backend, BD, colas, frontend, desktop, almacenamiento, iconografia.
- [x] Restricciones de canon incluidas: no Bootstrap, solo TailwindCSS 4.1, solo Lucide/Phosphor.
- [x] Justificacion de JavaScript (no TS) para apps/web documentada.
- [x] Consecuencias y politica de cambios de stack documentadas.

## Archivos creados
- `docs/09-adr/002-stack-tecnologico.md`

## Restricciones que establece este ADR
- Todo cambio de tecnologia de Nivel 2+ (stack principal) requiere nuevo ADR y revision humana.
- Prohibido Bootstrap, obligatorio TailwindCSS 4.1.
- Solo Lucide o Phosphor para iconos.
