# Estrategia de Seeds Iniciales

## ID de estrategia
- Task origen: `T-0028`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir la estrategia de seeds para bootstrap de datos mínimos en desarrollo, staging y pruebas controladas.

## Principios
- Idempotencia: ejecutar seeds múltiples veces sin generar duplicados no deseados.
- Trazabilidad: cada seed debe indicar módulo, versión y propósito.
- Seguridad: no incluir secretos reales ni datos productivos sensibles.
- Separación por entorno: seeds base vs seeds demo.

## Tipos de seeds
- Base obligatoria:
  - roles/permisos mínimos
  - organización demo controlada
  - catálogos iniciales requeridos
- Demo opcional:
  - datos de ejemplo para flujos funcionales

## Reglas operativas
- Seeds deben estar versionadas junto con el esquema.
- Cambios de seed deben documentar impacto en pruebas/entornos.
- Seeds de módulos futuros no se ejecutan en v1 si no están habilitados.

## Restricciones
- Prohibido usar datos reales de clientes.
- Prohibido hardcodear credenciales o tokens.

