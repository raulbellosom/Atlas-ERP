# T-0209 - Crear documento canon de CI/CD y despliegue

## Metadatos
- ID: `T-0209`
- Fase: `Fase 2`
- Bloque: `Bloque 2`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`

## Objetivo
Crear el documento canon que define los principios obligatorios de CI/CD y despliegue para AtlasERP.

## Alcance
- Definir las etapas obligatorias del pipeline.
- Definir la política de ramas y despliegue.
- Definir los requisitos de rollback.
- Aclarar el tratamiento especial de la app desktop.

## Fuera de alcance
- Elección de herramienta CI/CD concreta (GitHub Actions, GitLab CI, etc.) — Fase 4.
- Configuración de archivos de workflow — Fase 4.

## Dependencias
- `T-0208` cerrada (canon de environments define los ambientes de despliegue).
- `T-0038` cerrada (política de branches).

## Criterios de aceptación
- [x] Etapas del pipeline definidas en orden: lint → typecheck → tests → build → staging → aprobación → producción.
- [x] Ningún código llega a producción sin pipeline.
- [x] Rollback documentado como requisito antes del primer despliegue.
- [x] App desktop excluida explícitamente del pipeline de servidor.
- [x] Codificación UTF-8, idioma español de México.

## Documentación a actualizar
- `docs/00-canon/08_cicd_despliegue.md` (nuevo)

## Evidencia documental
- `docs/00-canon/08_cicd_despliegue.md`

## Pendientes para la siguiente task
- Iniciar `T-0210` (canon de convenciones de código).

## Pendientes no resueltos
- Ninguno.
