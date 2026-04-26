# Estrategia de Environment Variables

## ID de estrategia

- Task origen: `T-0040`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Definir el estandar de variables de entorno para AtlasERP con un solo archivo
local canonico en la raiz del monorepo.

## Principios no negociables

- Configuracion por ambiente (`dev`, `staging`, `prod`, `test`) y nunca
  hardcodeada.
- Fail fast: la app debe fallar al iniciar si falta configuracion obligatoria.
- No almacenar secretos reales en repositorio.
- Trazabilidad: cada variable debe tener proposito y owner.
- Un solo archivo local: `/.env`, creado desde `/.env.example`.

## Convenciones de nomenclatura

- Formato obligatorio: `MAYUSCULAS_CON_GUION_BAJO`.
- Variables publicas de cliente: prefijo `VITE_`.
- Variables compartidas de infraestructura: sin prefijo de app (`DATABASE_URL`,
  `REDIS_HOST`, `S3_BUCKET`, etc.).
- Variables especificas de una capacidad pueden usar prefijo de dominio, por
  ejemplo `MODULE_STORE_`.

## Distribucion de archivos

- `/.env.example`: catalogo completo y versionado para desarrollo local.
- `/.env`: configuracion local no versionada. Es el unico archivo `.env`
  soportado para correr el monorepo en host.
- No se usan `.env` ni `.env.example` por app.
- Ambientes de CI/CD deben inyectar variables desde su gestor de secretos.

## Almacenamiento S3-compatible

- Las variables `S3_*` describen el contrato de almacenamiento compatible con el
  API de S3.
- En desarrollo local el proveedor es MinIO.
- En produccion el proveedor puede ser MinIO, AWS S3 u otro servicio compatible.
- No se deben crear variables `MINIO_*` para las apps; Docker puede mapear
  internamente `S3_ACCESS_KEY` y `S3_SECRET_KEY` a `MINIO_ROOT_USER` y
  `MINIO_ROOT_PASSWORD`.

## Clasificacion minima

- Variables publicas: solo las estrictamente necesarias para cliente (`VITE_*`).
- Variables internas: backend, worker y desktop nativo; nunca expuestas al
  navegador.
- Secretos: se gestionan fuera de git y su estrategia se formaliza en `T-0041`.

## Validacion y gobernanza

- Cada app debe validar variables al arranque.
- Toda variable nueva requiere actualizar `/.env.example` y
  `docs/02-architecture/18-referencia-env-vars.md`.
- Cambios de variables deben incluir impacto, migracion y retrocompatibilidad.

## Restricciones

- Prohibido exponer secretos con prefijo `VITE_` o equivalente publico.
- Prohibido usar variables sin declarar en `/.env.example`.
