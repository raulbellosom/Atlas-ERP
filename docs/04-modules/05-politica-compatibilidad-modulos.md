# Política de Compatibilidad entre Módulos

## ID de política
- Task origen: `T-0034`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir criterios de compatibilidad para que la evolución de un módulo no rompa a otros módulos dependientes.

## Reglas
- Cada módulo debe respetar contratos públicos de datos y comportamiento.
- Cambios incompatibles requieren versión o plan de transición documentado.
- Integraciones entre módulos deben pasar por ownership y permisos definidos.
- Módulos futuros deben integrarse sin redefinir entidades core existentes.

## Criterio mínimo
- Antes de cerrar un cambio transversal, validar impacto en módulos actuales y futuros declarados.

## Restricciones
- Prohibido romper contratos entre módulos sin documentar migración.
- Prohibido acoplamiento implícito sin contrato explícito.

