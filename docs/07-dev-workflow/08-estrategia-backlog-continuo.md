# Estrategia de Backlog Continuo

## ID de estrategia
- Task origen: `T-0049`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir como se alimenta, mantiene y prioriza el backlog del proyecto a lo largo del tiempo, garantizando que el catalogo maestro (`business-platform-master-task-catalog.md`) permanezca como fuente de verdad operativa.

## Principio base
El backlog no es estatico. Nuevas tasks aparecen a medida que el proyecto crece, se descubren dependencias no previstas o surgen mejoras. La clave es que toda task nueva pase por el mismo proceso de registro y aprobacion antes de ejecutarse.

## Fuente de verdad del backlog
- El archivo `business-platform-master-task-catalog.md` es el catalogo oficial de todas las tasks del proyecto.
- Ninguna task se ejecuta sin estar registrada en el catalogo con su ID oficial.
- Las tasks que surjan en conversaciones, revisiones de codigo o sesiones de planificacion deben registrarse antes de ejecutarse.

## Como se agrega una task nueva

### 1. Identificacion
- Cualquier miembro del equipo puede proponer una task nueva.
- La propuesta debe incluir: titulo, fase sugerida, dependencias previas y justificacion breve.

### 2. Asignacion de ID
- El ID sigue la convencion de la fase correspondiente (T-XXXX donde XXXX es consecutivo dentro de la fase).
- Si la task es transversal o urgente y no encaja en una fase, se puede registrar con un ID de fase especial o como sub-task de una task existente.

### 3. Registro en el catalogo
- Se agrega al catalogo maestro en la seccion de la fase correcta.
- Estado inicial: sin sufijo (pendiente).
- Solo se marca CERRADA cuando tiene evidencia documental o de codigo.

### 4. Aprobacion
- Tasks de governance o arquitectura (Nivel 3+): requieren aprobacion del responsable tecnico antes de registrarse como activas.
- Tasks de implementacion dentro de un modulo ya aprobado: pueden registrarse y ejecutarse con revision de par.

## Mantenimiento del catalogo

### Revision periodica
- Al iniciar cada bloque de 5 tasks: revisar si el siguiente bloque sigue siendo correcto o si hay tasks que reordenar.
- Al cerrar cada fase: revisar si quedan tasks pendientes no ejecutadas y decidir si se mantienen, se posponen o se eliminan.

### Deuda de backlog
- Si una task lleva mas de 2 fases sin ejecutarse, debe revisarse si sigue siendo relevante.
- Las tasks descartadas se marcan como `- DESCARTADA` con razon documentada; nunca se eliminan del catalogo.

## Tasks generadas por IA
- Las tasks propuestas o generadas por IA no se registran como activas sin revision humana.
- Aplica la politica de revision de tasks generadas por IA (`docs/07-dev-workflow/07-revision-tasks-ia.md`).

## Backlog de bugs y hotfixes
- Los bugs criticos de produccion se registran como tasks con prefijo de emergencia y se insertan al inicio del bloque activo.
- Los bugs no criticos se registran como tasks normales en el siguiente bloque disponible.
