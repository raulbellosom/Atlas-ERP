# Criterios de "Módulo Terminado"

## ID de criterio
- Task origen: `T-0036`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Definición
Un módulo se considera terminado cuando cumple alcance funcional aprobado, calidad mínima, seguridad, auditoría, política de sincronización y documentación completa.

## Checklist mínimo de cierre de módulo
- Dominio y ownership del módulo definidos y validados.
- Backend y frontend implementados conforme al alcance acordado.
- Permisos y auditoría aplicados en operaciones críticas.
- Política offline/sync declarada e integrada (cuando aplique).
- Estados UX mínimos cubiertos: `loading`, `empty`, `error`, `offline`, `sync pending`.
- Pruebas mínimas del módulo ejecutadas y documentadas.
- Documentación del módulo, blueprints y tasks de implementación actualizada.

## Restricciones
- No declarar módulo terminado con pendientes críticos abiertos.
- No cerrar módulo sin trazabilidad de decisiones y evidencia documental.
