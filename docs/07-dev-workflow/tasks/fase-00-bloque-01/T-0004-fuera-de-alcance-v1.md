# T-0004 - Definir explícitamente qué NO entra en v1

## Metadatos
- ID: `T-0004`
- Fase: `Fase 0`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Definir límites explícitos de v1 para evitar compromisos no planeados y proteger la calidad de entrega inicial.

## Alcance
- Declarar lista de capacidades no incluidas en v1.
- Declarar restricciones de diseño/arquitectura intencionales.

## Fuera de alcance
- Plan detallado de versiones posteriores.
- Estrategia comercial de releases.

## Dependencias
- `T-0003` cerrada.

## Criterios de aceptación
- [x] Lista de exclusiones de v1 documentada.
- [x] Restricciones técnicas críticas documentadas.
- [x] Documento fuera de alcance v1 creado.

## Validaciones
- Revisión de coherencia con reglas maestras del proyecto.
- Revisión de coherencia con arquitectura modular y políticas de sync.

## Pruebas
- Prueba documental: contraste contra reglas en `CODEX_START_HERE.md` y canon.

## Riesgos
- Falta de límites claros incrementa riesgo de scope creep.

## Documentación a actualizar
- `docs/01-product/02-fuera-de-alcance-v1.md`

## Decisiones clave
- Se excluye offline total libre.
- Se excluye ERP completo en v1.
- Se excluyen módulos futuros completos (Accounting/HR/etc.) en esta etapa.

## Evidencia documental
- `docs/01-product/02-fuera-de-alcance-v1.md`
- `CODEX_START_HERE.md`

## Pendientes para la siguiente task
- Definir visión de 3 horizontes (`T-0005`).

