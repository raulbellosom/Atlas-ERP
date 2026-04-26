# Arquitectura CI/CD — AtlasERP

**Versión:** 1.0
**Fecha:** 2026-04-18
**Task origen:** T-1922 (Fase 19 Bloque 5)

---

## Visión general

AtlasERP usa GitHub Actions como plataforma CI/CD. Hay dos tipos de workflows:
- **Workflows de validación**: se ejecutan en PRs para asegurar calidad antes del merge.
- **Workflows de build y deploy**: se ejecutan al llegar código a `main` o al publicar tags.

---

## Mapa de workflows

| Archivo | Trigger | Propósito |
|---------|---------|-----------|
| `pr.yml` | Pull Request a `main` | Lint, typecheck, unit tests, build check |
| `main.yml` | Push a `main` | Suite completa de tests + build + deploy staging |
| `release.yml` | Push a `main` | Semantic versioning + CHANGELOG + GitHub Release |
| `build-backend.yml` | `workflow_call` | Build y push imagen Docker de la API |
| `build-frontend.yml` | `workflow_call` | Build y push imagen Docker del frontend |
| `build-worker.yml` | `workflow_call` | Build y push imagen Docker del worker |
| `build-desktop.yml` | Tag `desktop-v*` / `workflow_dispatch` | Compilación Tauri (Windows installer) |
| `docker-build.yml` | `workflow_call` | Build de imágenes API + Worker en un solo job |
| `tests.yml` | `workflow_call` | Suite completa de tests (unit + integration + sync + e2e + smoke) |
| `lint-typecheck.yml` | `workflow_call` | Lint y typecheck paralelos para todas las apps |
| `prisma-validate.yml` | PR/push con cambios en `prisma/` | Valida schema, migraciones y cliente Prisma |
| `deploy-staging.yml` | `workflow_call` / `workflow_dispatch` | Migraciones Prisma + deploy + healthcheck en staging |
| `deploy-prod.yml` | Tag `v*.*.*` / `workflow_dispatch` | Migraciones Prisma + deploy + healthcheck en producción |

---

## Flujo completo de un PR a producción

```
Developer → PR abierto
    ↓
pr.yml (lint + typecheck + unit tests + build check)
    ↓ si verde
Code Review → merge a main
    ↓
main.yml: full-validation → build-artifacts → deploy-staging → post-deploy-smoke
    ↓ paralelo
release.yml: semantic-release → CHANGELOG.md → GitHub Release + Git tag
    ↓ (decisión del equipo)
deploy-prod.yml: Prisma migrations → deploy → healthcheck → rollback si falla
```

---

## Secretos de CI/CD

Los secretos se configuran en **GitHub → Settings → Secrets and variables → Actions**.

### Secretos globales (todos los environments)

| Secret | Descripción |
|--------|-------------|
| `GITHUB_TOKEN` | Automático — GitHub lo provee para cada workflow |

### Environment: `staging`

| Secret | Descripción |
|--------|-------------|
| `STAGING_DATABASE_URL` | URL completa de conexión a la BD de staging |
| `STAGING_SSH_KEY` | Clave SSH privada para conectar al servidor de staging |
| `STAGING_DEPLOY_USER` | Usuario SSH en el servidor de staging |
| `STAGING_DEPLOY_HOST` | IP o hostname del servidor de staging |

### Environment: `production`

| Secret | Descripción |
|--------|-------------|
| `PROD_DATABASE_URL` | URL completa de conexión a la BD de producción |
| `PROD_SSH_KEY` | Clave SSH privada para conectar al servidor de producción |
| `PROD_DEPLOY_USER` | Usuario SSH en el servidor de producción |
| `PROD_DEPLOY_HOST` | IP o hostname del servidor de producción |

**Los valores reales de estos secretos nunca se documentan aquí ni en ningún archivo del repositorio.**

---

## Variables de entorno por workflow

Cada workflow inyecta las variables de entorno específicas para su propósito. Las variables de runtime del servidor (DATABASE_URL, JWT_SECRET, etc.) se inyectan desde secrets de GitHub al ejecutar el comando de deploy/migración.

Ver la tabla completa de variables por ambiente en: `docs/07-dev-workflow/environments.md`.

---

## Cómo intervenir en un deploy atascado o fallido

### Caso 1: PR bloqueado en CI

1. Ver el job fallido en la pestaña **Actions** del PR.
2. Expandir el step que falló para ver el error.
3. Corregir el código, hacer commit y push — el CI se re-ejecuta automáticamente.

### Caso 2: Deploy a staging fallido

1. Ir a **Actions** → buscar el workflow fallido.
2. Ver el step de healthcheck para determinar si el fallo fue en la app o en el deploy.
3. Si fue un error de código: hacer fix, PR y merge a `main` — el nuevo merge triggerea otro deploy.
4. Si fue un error de infraestructura: conectarse al servidor de staging y revisar los logs de Docker.
5. Para forzar un re-deploy de una versión específica: usar `workflow_dispatch` en `deploy-staging.yml` con el `image-tag` deseado.

### Caso 3: Deploy a producción fallido con rollback

El workflow `deploy-prod.yml` ejecuta rollback automático si el healthcheck falla (T-1916). Si el rollback automático no es suficiente:

1. Verificar qué versión está corriendo en producción.
2. Ejecutar manualmente `workflow_dispatch` en `deploy-prod.yml` con el `image-tag` de la última versión buena.
3. Notificar al equipo del incidente.
4. Documentar el incidente en el log del proyecto.

### Caso 4: GitHub Actions no disponible

Si GitHub Actions no está disponible, el deploy manual sigue el proceso documentado en:
- `docs/00-canon/10_release_strategy_backend.md` — backend
- `docs/00-canon/09_release_strategy_frontend.md` — frontend
- `docs/07-dev-workflow/release-desktop-guide.md` — desktop

---

## Cómo disparar un deploy manual

### Deploy a staging

1. Ir a **Actions** → **Deploy to Staging**.
2. Clic en **Run workflow**.
3. Ingresar el `image-tag` (ej: `sha-abc1234`).
4. Confirmar.

### Deploy a producción

1. Ir a **Actions** → **Deploy to Production**.
2. Clic en **Run workflow**.
3. Ingresar el `image-tag` y escribir `deploy-to-prod` en el campo de confirmación.
4. El workflow requiere aprobación del environment `production` en GitHub.

### Release del desktop

Crear un tag `desktop-v1.x.x` — el workflow `build-desktop.yml` se dispara automáticamente.

---

## Tiempo esperado de los workflows

| Workflow | Tiempo estimado |
|----------|----------------|
| `pr.yml` | 5–8 minutos |
| `main.yml` (completo) | 15–20 minutos |
| `release.yml` | 1–2 minutos |
| `build-desktop.yml` | 20–30 minutos |
| `deploy-staging.yml` | 3–5 minutos |
| `deploy-prod.yml` | 5–8 minutos |

---

## Referencias

- Ambientes: `docs/07-dev-workflow/environments.md`
- Estrategia de releases: `docs/00-canon/09_release_strategy_frontend.md`, `10_release_strategy_backend.md`, `11_release_strategy_desktop.md`
- Prisma workflow: `docs/07-dev-workflow/prisma-workflow.md`
- Guía de release desktop: `docs/07-dev-workflow/release-desktop-guide.md`
