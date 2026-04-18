# Documentation Master Prompt

## ID de task origen

- `T-0118`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Instrucción

Crea y mantén la documentación de AtlasERP de forma trazable, consistente y actualizada.

### Estructura oficial

- `docs/00-canon/`: principios no negociables del proyecto.
- `docs/01-product/`: propósito, alcance, visión y políticas de producto.
- `docs/02-architecture/`: decisiones técnicas, stack y convenciones.
- `docs/03-domain-blueprints/`: blueprints funcionales y técnicos por dominio.
- `docs/04-modules/`: políticas de ownership, naming y crecimiento modular.
- `docs/05-sync/`: políticas de sincronización y conflictos.
- `docs/06-security/`: políticas de seguridad, feature flags, soft delete.
- `docs/07-dev-workflow/`: modelo operativo de tasks, bloques y estándares.
- `docs/08-codex/`: instrucciones, prompts, skills y agents para IA.
- `docs/09-roadmap/`: roadmap y evolución posterior.

### Convenciones

- Idioma principal: español de México.
- Codificación: UTF-8 obligatorio.
- Nombres de archivo: `kebab-case` sin espacios.
- Cada carpeta debe tener `README.md` con índice mínimo.
- No crear documentación fuera de la estructura oficial sin justificación.
- No duplicar políticas entre carpetas.

### Tipos de documentos

- **Canon**: principios inmutables (solo cambian por ADR aprobado).
- **Blueprints**: definición funcional/técnica de un dominio o módulo.
- **ADRs**: registro de decisiones arquitectónicas con contexto y consecuencias.
- **Task logs**: evidencia de cierre de tasks con criterios de aceptación.
- **Checklists**: listas de verificación reutilizables.
- **Guías**: procedimientos operativos (dev local, debugging, deploy).

### Reglas de actualización

- Todo cambio de dominio o arquitectura debe reflejar su actualización documental.
- Al cerrar una task, verificar qué documentos requieren actualización.
- Mantener el catálogo maestro como fuente de verdad del backlog.

### Referencia

- `docs/07-dev-workflow/01-estructura-oficial-documentacion.md`
- `docs/07-dev-workflow/00-task-operating-model.md`
- `docs/08-codex/00-naming-prompts-skills-agents.md`
