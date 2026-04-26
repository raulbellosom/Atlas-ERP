# Modelo Operativo de Tasks

## Objetivo
Definir cómo AtlasERP crea, ejecuta y cierra tasks de forma trazable, incremental y consistente con el backlog maestro.

## Reglas operativas base
- La ejecución se realiza por bloques de 5 tasks.
- No se salta el orden lógico del backlog cuando exista dependencia fuerte.
- Cada task debe tener un archivo detallado y un estado explícito.
- Una task solo se marca como cerrada cuando cumple dependencias, criterios de aceptación y documentación actualizada.
- Si una task cierra con pendientes no resueltos, deben registrarse en `docs/07-dev-workflow/task-pending-registry.md`.
- El idioma oficial es español de México.
- La codificación obligatoria para archivos de texto es UTF-8.

## Ciclo de vida de task
1. `draft`: task identificada y lista para ser detallada.
2. `in_progress`: task en ejecución.
3. `blocked`: task detenida por dependencia o riesgo.
4. `review`: task completa y en revisión de consistencia.
5. `closed`: task aprobada con evidencia.

## Contrato mínimo obligatorio por task
Cada archivo detallado de task debe incluir:
- ID
- Objetivo
- Alcance
- Fuera de alcance
- Dependencias
- Criterios de aceptación
- Validaciones
- Pruebas
- Riesgos
- Documentación a actualizar
- Estado
- Decisiones clave
- Evidencia documental
- Pendientes para la siguiente task
- Pendientes no resueltos (si aplica)

## Criterios de cierre por task
- Dependencias: cumplidas o documentadas como no aplicables.
- Criterios de aceptación: 100% en estado cumplido.
- Consistencia: alineada con `CODEX_START_HERE.md`, canon `docs/00-canon/*` y backlog maestro.
- Idioma y codificación: español de México y UTF-8 sin texto corrupto.
- Evidencia: referencias concretas a documentos actualizados.
- Pendientes no resueltos: registrados en el archivo general si existen.

## Cierre de bloque (5 tasks)
Al cerrar un bloque:
- Se actualiza el tablero de estado del bloque.
- Se registran riesgos residuales.
- Se registran pendientes para el siguiente bloque.
- Se confirma habilitación para continuar con la siguiente task del backlog.

## Bloque activo inicial
- Bloque: Fase 0 / Bloque 1
- Tasks objetivo: `T-0001` a `T-0005`
- Estado esperado del bloque: cerrado

