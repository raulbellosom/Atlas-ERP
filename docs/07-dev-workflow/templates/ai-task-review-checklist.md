# Checklist de Revisión de Task Generada por IA

## ID de task origen

- `T-0139`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Instrucciones de uso

Aplicar este checklist antes de cerrar cualquier task generada o asistida por IA (Codex, Claude, Copilot u otros). Este checklist complementa los criterios generales de `docs/07-dev-workflow/02-criterios-task-terminada.md`.

---

## Checklist para documentos generados por IA

- [ ] El contenido es coherente con el canon (`docs/00-canon/*`).
- [ ] No contradice decisiones de arquitectura registradas (`docs/02-architecture/*`).
- [ ] El idioma es español de México, sin mojibake ni caracteres corruptos.
- [ ] La codificación del archivo es UTF-8.
- [ ] Los nombres de archivos siguen `kebab-case` sin espacios.
- [ ] No hay contenido inventado (referencias a tasks, archivos o sistemas que no existen).
- [ ] Los criterios de aceptación están realmente cumplidos, no solo marcados.
- [ ] No hay duplicación de información que ya existe en otra carpeta.
- [ ] Las referencias a otros documentos son válidas y verificables.
- [ ] El formato Markdown es correcto y legible.

## Checklist para código generado por IA

- [ ] No introduce vulnerabilidades de seguridad (inyección SQL, XSS, exposición de secretos).
- [ ] Sigue las convenciones de naming del proyecto (endpoints, componentes, servicios).
- [ ] No introduce dependencias nuevas sin justificación y revisión de Nivel 2.
- [ ] Pasa el linter y el typecheck del proyecto.
- [ ] Incluye pruebas donde la task lo requiere.
- [ ] No rompe interfaces existentes sin documentarlo.
- [ ] La lógica de negocio es correcta y coincide con el blueprint del módulo.
- [ ] Los DTOs incluyen validaciones apropiadas.
- [ ] Los endpoints tienen guards de auth y permisos.
- [ ] Las operaciones críticas generan AuditLog.
- [ ] Los estados UX están cubiertos en componentes frontend.

## Checklist para tasks de governance/decisiones generadas por IA

- [ ] La decisión no contradice el canon existente.
- [ ] Si modifica una política, el cambio está documentado como ADR.
- [ ] No se auto-aprobó una decisión de Nivel 3 o superior sin revisión humana.
- [ ] El backlog maestro fue actualizado si corresponde.

## Notas

- La IA no puede auto-aprobar tasks de Nivel 3 o 4.
- La IA no puede modificar el canon sin instrucción explícita y revisión posterior.
- El responsable de la revisión es quien solicitó la generación.
- La revisión ocurre ANTES de cerrar la task, no después.

## Referencia

- `docs/07-dev-workflow/07-revision-tasks-ia.md`
- `docs/07-dev-workflow/02-criterios-task-terminada.md`
