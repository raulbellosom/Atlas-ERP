# T-1200 - Refinar blueprint de Financial Operations Core

## Metadatos
- ID: `T-1200`
- Fase: `Fase 12`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de actualización: `2026-04-13`
- Agente responsable: `DesktopAgent`

## Objetivo
Refinar el blueprint de dominio de Financial Operations Core como base de planificación e implementación de toda la Fase 12. El blueprint debe dejar claros el propósito de negocio, el estado actual del módulo y los lineamientos operativos para que las tasks siguientes tengan contexto inequívoco.

## Alcance
- Revisar y actualizar el documento `docs/03-domain-blueprints/financial-operations-core.md`.
- Redactar propósito de negocio del módulo en lenguaje de dominio (no técnico).
- Establecer el estado del blueprint (activo, en construcción) y su versión.
- Añadir lineamientos operativos: scoping multi-tenant, autorización, trazabilidad.
- Dejar secciones preparadas para `T-1205` (Sync Core) y `T-1206` (evolución hacia Accounting Core).

## Fuera de alcance
- No incluye creación de código, migraciones ni configuración de módulo NestJS.
- No define DTOs, endpoints ni lógica de negocio.
- No implementa ni detalla Accounting Core (Fase futura).
- No incluye integraciones bancarias automáticas.
- No define seeds ni datos demo.

## Dependencias
- Core Platform completado (`T-0900` a `T-0923`): provee `Organization`, `User`, `Role`, `AuditLog`, `Attachment`.
- Sync Core completado (`T-0800` a `T-0840`): define política de sincronización sobre la que opera el módulo.
- Blueprint inicial de Financial Operations existente en `docs/03-domain-blueprints/` (versión pre-Fase 12).
- Catálogo maestro de tasks y mapa de módulos: para validar que el alcance no entra en conflicto con otros módulos.

## Criterios de aceptación
- [x] El blueprint está actualizado y consistente con AtlasERP v1.
- [x] El propósito y objetivo del módulo quedaron explícitos en lenguaje de dominio.
- [x] Existe trazabilidad de preparación hacia Sync Core (`T-1205`) y Accounting Core (`T-1206`).
- [x] El estado y versión del blueprint están declarados.
- [x] Los lineamientos de scoping, autorización y auditoría están referenciados.

## Validaciones
- Revisar consistencia del blueprint contra `docs/01-product/01-alcance-v1.md`.
- Confirmar que el propósito de negocio alinea con `docs/00-canon/`.
- Verificar que no contradice el mapa de relaciones de módulos (`docs/03-domain-blueprints/mapa-relaciones-modulos.md`).
- Validar encoding UTF-8 y sin mojibake en el documento.

## Pruebas
- Revisión manual: el blueprint se puede leer de manera autónoma sin necesitar otros documentos para entender el módulo.
- Revisión cruzada: las entidades mencionadas en el blueprint tienen correspondencia en el mapa de módulos.
- Prueba de preparación: las secciones para `T-1205` y `T-1206` están presentes y tienen marcador de "pendiente".

## Riesgos
- **Alcance impreciso**: un propósito de negocio vago genera expansión de scope en implementación. Mitigación: usar criterios de aceptación de `T-1201` como ancla.
- **Inconsistencia con Core Platform**: si el blueprint asume capacidades no disponibles en Core Platform. Mitigación: revisar explícitamente las entidades exportadas por Core Platform antes de cerrar.

## Documentación a actualizar
- `docs/03-domain-blueprints/financial-operations-core.md` — documento principal de esta task.
- `docs/03-domain-blueprints/mapa-relaciones-modulos.md` — añadir o confirmar la entrada de Financial Operations Core.

## Decisiones clave
- **Ejecución anticipada de Fase 12**: aunque el modelo de dependencias establece Fase 11 → Fase 12 en secuencia, el trabajo de dominio/datos es independiente del Design System UI. Se decidió iniciar Fase 12 sin esperar el cierre completo de Fase 11.
- **Blueprint como documento vivo**: el blueprint se actualizará en sucesivos tasks del bloque (T-1201 a T-1204) sin crear versiones paralelas — un solo documento con secciones incrementales.

## Evidencia documental
- `docs/03-domain-blueprints/financial-operations-core.md` (refinado en esta task).

## Pendientes para la siguiente task
- `T-1201` debe detallar el alcance exacto de v1 con la lista explícita de capacidades incluidas.
- `T-1202` debe declarar el fuera de alcance para blindar contra expansión de scope.

## Pendientes no resueltos
- Ninguno.
