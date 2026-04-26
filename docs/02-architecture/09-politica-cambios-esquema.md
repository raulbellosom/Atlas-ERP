# Política de Cambios de Esquema

## ID de política
- Task origen: `T-0033`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir reglas para cambios de esquema de datos sin romper consistencia ni trazabilidad.

## Reglas
- Todo cambio de esquema debe tener migración versionada.
- Cambios incompatibles requieren estrategia explícita de transición.
- Debe documentarse impacto en módulos, seeds y contratos.
- Cambios que afecten sync o auditoría requieren validación adicional.

## Flujo mínimo
1. Documentar propuesta de cambio.
2. Crear migración.
3. Validar impacto en datos existentes.
4. Actualizar documentación y pruebas relacionadas.

## Restricciones
- Prohibido cambios directos en producción sin migración controlada.
- Prohibido cambios de esquema sin actualización documental asociada.

