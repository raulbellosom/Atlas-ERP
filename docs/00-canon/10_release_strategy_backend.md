# Estrategia de Release del Backend â€” AtlasERP

**VersiÃ³n:** 1.0
**Fecha:** 2026-04-18
**Task origen:** T-1918 (Fase 19 Bloque 4)

---

## VisiÃ³n general

El backend (NestJS API + BullMQ Worker) se distribuye como imÃ¡genes Docker inmutables publicadas en GitHub Container Registry (GHCR). Cada imagen tiene un tag que la identifica de forma Ãºnica y permanente.

---

## Principios de inmutabilidad de imÃ¡genes

1. **Una imagen, un tag, un contenido.** Una vez publicada una imagen con el tag `sha-abc1234` o `v1.2.3`, ese tag nunca se reutiliza para un contenido diferente.
2. **Latest solo para referencia.** El tag `latest-staging` o `latest-production` puede moverse, pero siempre apunta a la imagen mÃ¡s reciente en ese ambiente.
3. **El historial estÃ¡ en el registry.** Cualquier versiÃ³n anterior puede redesplegar en segundos.

---

## Ciclo de vida de un release de backend

### 1. Development â†’ Staging

Al hacer merge a `main`:
1. GitHub Actions ejecuta `full-validation` (lint + tests).
2. Si pasan: `build-backend.yml` construye la imagen con tag `sha-{commit}`.
3. La imagen se publica en GHCR.
4. `deploy-staging.yml` aplica migraciones Prisma en staging y despliega la nueva imagen.
5. Healthcheck verifica que la API responde en staging.

### 2. Staging â†’ ProducciÃ³n (release candidate)

Proceso previo al release:
1. Verificar que la versiÃ³n en staging estÃ¡ estable (healthchecks OK, QA completado).
2. Actualizar `CHANGELOG.md` con los cambios del release.
3. Actualizar el nÃºmero de versiÃ³n en `apps/api/package.json` y `apps/worker/package.json`.
4. Crear PR de release â†’ merge a `main`.
5. Crear tag: `git tag v1.2.3 && git push origin v1.2.3`.

GitHub Actions detecta el tag y:
1. Construye imÃ¡genes con tag `v1.2.3`.
2. Publica en GHCR.
3. `deploy-prod.yml` aplica migraciones Prisma en producciÃ³n y despliega.

### 3. PolÃ­tica de backward-compatibility

El backend expone una API REST que consumen:
- El frontend web (SPA React â€” se actualiza junto al backend en cada release).
- La app desktop Tauri (se actualiza bajo demanda â€” puede estar en versiones anteriores).

Reglas:
- **Los endpoints existentes nunca cambian de firma de forma incompatible** en la misma versiÃ³n mayor.
- **Agregar campos a respuestas** es compatible (los clientes ignoran campos desconocidos).
- **Eliminar campos de respuestas o cambiar tipos** es un breaking change â†’ requiere nueva versiÃ³n mayor.
- **La app desktop puede estar 1-2 versiones atrÃ¡s** â€” el backend debe mantener compatibilidad con ella durante al menos 60 dÃ­as tras cada release.

---

## Proceso de deploy en producciÃ³n (Docker Compose)

```bash
# En el servidor de producciÃ³n:

# 1. Pull de la nueva imagen
docker pull ghcr.io/{org}/atlaserp-api:v1.2.3
docker pull ghcr.io/{org}/atlaserp-worker:v1.2.3

# 2. Parar el servicio antiguo (gap ~1-2 segundos)
docker stop atlaserp-api atlaserp-worker

# 3. Iniciar el nuevo servicio
docker run -d --name atlaserp-api \
  --env-file /opt/atlaserp/.env.prod \
  -p 3000:3000 \
  ghcr.io/{org}/atlaserp-api:v1.2.3

docker run -d --name atlaserp-worker \
  --env-file /opt/atlaserp/.env.prod \
  ghcr.io/{org}/atlaserp-worker:v1.2.3

# 4. Healthcheck
curl https://api.atlaserp.com/health
```

Para downtime 0: nginx como reverse proxy con upstream activo durante el swap â€” Fase 22+.

---

## Migraciones de base de datos

Las migraciones se aplican **antes** de iniciar los nuevos contenedores:

1. `prisma migrate deploy` â€” aplica todas las migraciones pendientes.
2. Si la migraciÃ³n falla â†’ deploy se aborta, los contenedores antiguos siguen corriendo.
3. Las migraciones son backwards-compatible por polÃ­tica: la versiÃ³n anterior de la API puede correr con el schema nuevo sin errores.

Migraciones destructivas (DROP COLUMN, etc.) se hacen en dos releases:
1. Release 1: deprecar la columna (se deja de usar, pero existe).
2. Release 2: eliminar la columna (ya no hay cÃ³digo que la referencie).

---

## Rollback de backend

Si el healthcheck post-deploy falla:

```bash
# Automatizado en el workflow (ver deploy-staging.yml / deploy-prod.yml)
docker stop atlaserp-api atlaserp-worker
docker run -d --name atlaserp-api \
  ghcr.io/{org}/atlaserp-api:{previous-tag}
docker run -d --name atlaserp-worker \
  ghcr.io/{org}/atlaserp-worker:{previous-tag}
```

El workflow captura el tag anterior antes de hacer el deploy y lo usa en el rollback.

---

## Referencias

- Workflow build: `.github/workflows/build-backend.yml`
- Workflow deploy staging: `.github/workflows/deploy-staging.yml`
- Workflow deploy prod: `.github/workflows/deploy-prod.yml`
- Estrategia de rollback: T-1916
- PolÃ­tica de ambientes: `docs/07-dev-workflow/environments.md`

