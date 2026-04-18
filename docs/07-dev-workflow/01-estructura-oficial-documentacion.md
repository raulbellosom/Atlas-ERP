# Estructura Oficial de Documentación

## ID de decisión
- Task origen: `T-0026`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir la estructura oficial de documentación para mantener trazabilidad, gobierno técnico y escalabilidad modular.

## Estructura oficial
- `docs/00-canon/`: principios no negociables.
- `docs/01-product/`: propósito, alcance, visión y políticas de producto.
- `docs/02-architecture/`: decisiones técnicas, stack y convenciones de arquitectura.
- `docs/03-domain-blueprints/`: blueprints funcionales/técnicos por dominio.
- `docs/04-modules/`: políticas y convenciones de módulos.
- `docs/05-sync/`: políticas de sincronización y conflictos.
- `docs/06-security/`: políticas de seguridad, cumplimiento y gobernanza sensible.
- `docs/07-dev-workflow/`: operación de tasks, bloques y estándares de ejecución.
- `docs/08-codex/`: instrucciones, prompts, skills y agentes.
- `docs/09-roadmap/`: roadmap y evolución posterior.

## Reglas de uso
- Todo cambio de dominio o arquitectura debe reflejarse en la carpeta correspondiente.
- Cada carpeta debe tener `README.md` con índice mínimo.
- No crear documentación suelta fuera de la estructura oficial sin justificación explícita.
- Mantener idioma principal `es-MX` y codificación UTF-8.

## Restricciones
- Evitar duplicación de una misma política en múltiples carpetas.
- Evitar documentos sin owner funcional/técnico.

