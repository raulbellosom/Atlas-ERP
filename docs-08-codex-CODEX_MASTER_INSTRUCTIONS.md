# CODEX MASTER INSTRUCTIONS

## Objetivo

Estas instrucciones gobiernan el comportamiento esperado de Codex dentro del repositorio.

## Instrucciones globales

- Usar AtlasERP como nombre interno de código y Atlas ERP como nombre visible temporal.
- Siempre leer primero CODEX_START_HERE.md.
- Usar español de México como idioma principal de documentación y comunicación del proyecto.
- Guardar todos los archivos de texto en UTF-8 para evitar errores de codificación.
- Usar naming consistente para prompts, skills y agents según `docs/08-codex/00-naming-prompts-skills-agents.md`.
- Respetar el backlog maestro de tasks.
- No crear código fuera de arquitectura modular.
- No crear entidades nuevas sin definir ownership.
- No crear módulos nuevos sin blueprint.
- Actualizar documentación cuando cambie el dominio o la arquitectura.
- Mantener el backend en TypeScript y el frontend en JavaScript.
- Mantener Prisma como capa de modelo relacional principal.
- Mantener PostgreSQL como base central del servidor.
- Mantener SQLite solo como base local auxiliar del cliente.
- No usar Bootstrap.
- Usar TailwindCSS 4.1.
- Usar Lucide o Phosphor para iconografía.
- Toda pantalla importante debe soportar:
  - loading
  - empty
  - error
  - offline
  - sync pending
- Toda operación crítica debe auditarse.
- Toda feature sensible debe revisar permisos.
- Toda entidad sincronizable debe declarar su política de sync.
- No asumir conflictos mágicamente resueltos.
- Preferir cambios incrementales.
- Evitar refactors masivos sin justificación clara.

## Instrucciones por capa

### Backend

- usar NestJS modular
- usar DTOs claros
- usar services limpios
- mantener controladores delgados
- usar Prisma para acceso a datos
- separar dominio, infraestructura y utilidades comunes donde tenga sentido

### Frontend

- usar React en JavaScript
- mantener carpetas por módulos
- reutilizar componentes base desde `packages/ui`
- no mezclar lógica de sync compleja directamente en componentes visuales
- priorizar UX profesional, consistente y limpia

### Desktop

- Tauri debe actuar como shell y puente local
- la lógica de negocio sigue viviendo principalmente en backend y frontend compartido
- SQLite local debe usarse para cola, caché y snapshots controlados
- los bridges nativos deben ser mínimos y claros

### Sync

- implementar cola local
- validar en servidor
- registrar conflictos
- permitir revisión humana
- auditar cada resolución

## Instrucciones sobre tareas

Cuando se ejecute una task:

1. identificar el ID
2. revisar dependencias
3. revisar canon y blueprints aplicables
4. implementar alcance exacto
5. agregar pruebas apropiadas
6. actualizar documentación relacionada
7. dejar notas para la siguiente task si aplica

## Instrucciones sobre documentación

Cada cambio relevante debe actualizar alguno de:

- canon
- blueprints
- ADRs
- task logs
- changelog técnico

## Instrucciones sobre calidad

- preferir código explícito
- evitar complejidad accidental
- no sobre-ingenierizar
- diseñar para crecimiento modular
- no romper compatibilidad sin documentarlo

