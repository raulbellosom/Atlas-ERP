# Canon: CI/CD y Despliegue

## Principios no negociables

- Ningún código llega a producción sin pasar por el pipeline de CI/CD.
- El pipeline es la única vía de despliegue autorizada para staging y producción.
- Todo despliegue en producción debe ser trazable: quién lo inició, qué commit, cuándo.
- Los despliegues se hacen por artefacto versionado, no por rama directa.

## Etapas obligatorias del pipeline

```
Push/PR → Lint → Typecheck → Tests → Build → Deploy staging → [aprobación manual] → Deploy producción
```

1. **Lint y format**: el código debe pasar el linter del proyecto sin errores.
2. **Typecheck**: el backend (TypeScript) no puede tener errores de tipos.
3. **Tests**: las pruebas deben pasar antes de continuar.
4. **Build**: el artefacto debe compilar sin errores.
5. **Deploy staging**: despliegue automático a staging tras merge a rama principal.
6. **Aprobación manual**: un humano autoriza el pase a producción.
7. **Deploy producción**: despliegue controlado con posibilidad de rollback.

## Política de ramas y despliegue

- La rama `main` es la rama de producción. Solo recibe merges desde `staging` o desde PRs aprobadas.
- No se hace push directo a `main`.
- Ver `docs/07-dev-workflow/05-politica-branches-prs.md` para detalle de ramas.

## Rollback

- Todo despliegue debe poder revertirse en menos de 15 minutos en producción.
- El mecanismo de rollback debe estar documentado antes de hacer el primer despliegue a producción.
- Los rollbacks de base de datos siguen la estrategia de restauración (`docs/02-architecture/13-estrategia-restauracion.md`).

## Herramientas

- La herramienta de CI/CD concreta (GitHub Actions, GitLab CI, etc.) se define en la Fase 4 (`T-0400+`).
- Este canon define los principios y etapas, no la herramienta específica.

## App desktop

- La app desktop (Tauri) no se distribuye via Docker ni via CI/CD de servidor.
- Su proceso de build y distribución se define en el blueprint técnico de Desktop (`docs/03-domain-blueprints/`).
