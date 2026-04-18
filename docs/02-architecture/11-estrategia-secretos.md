# Estrategia de Secretos

## ID de estrategia
- Task origen: `T-0041`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir el manejo oficial de secretos en AtlasERP: qué es un secreto, dónde vive, cómo se accede y cómo se rota, garantizando que ningún secreto quede expuesto en el repositorio ni en logs.

## Definicion de secreto
Un secreto es cualquier valor que, de ser expuesto, permitiría acceso no autorizado a un sistema, dato o servicio. Ejemplos:
- Credenciales de base de datos (usuario y contraseña PostgreSQL)
- Tokens JWT (signing secrets)
- Claves de API externas (pagos, correo, integraciones)
- Credenciales de acceso a MinIO/S3
- Tokens de acceso a servicios de CI/CD
- Claves de cifrado en reposo

## Principios no negociables
- Ningun secreto puede existir en el repositorio, ni en texto plano ni cifrado con clave en el mismo repo.
- Ningun secreto puede aparecer en logs de ninguna aplicacion.
- Los secretos no se pasan por query string ni por URLs.
- Acceso minimo necesario: cada servicio solo conoce los secretos que necesita para operar.
- Todo secreto debe tener un owner definido (quien lo crea, quien lo rota).

## Donde viven los secretos

### Ambiente de desarrollo local
- Archivo `.env.local` en la raiz del desarrollador, nunca versionado.
- `.gitignore` debe incluir `.env.local` y cualquier variante de `.env` con valores reales.
- Cada desarrollador es responsable de obtener los valores del owner del secreto.

### Ambiente de CI/CD (staging y prod)
- Los secretos se inyectan como variables de entorno desde el gestor de secretos del proveedor CI/CD.
- Nunca se hardcodean en archivos de workflow ni en Dockerfiles.
- Opciones validas: GitHub Actions Secrets, GitLab CI Variables, Doppler, HashiCorp Vault.

### Produccion
- Gestor de secretos externo obligatorio (Doppler, Vault u equivalente aprobado).
- Las apps reciben secretos en tiempo de ejecucion, no en imagen de contenedor.
- Rotacion sin redeploy es preferida cuando el gestor lo soporte.

## Categorias de secretos por aplicacion

| Secreto | Owner | Apps que lo usan |
|---------|-------|-----------------|
| `DATABASE_URL` | DevOps/Backend | api, worker |
| `JWT_SECRET` | Backend | api |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | DevOps | api, worker |
| `REDIS_URL` | DevOps | api, worker |
| `SMTP_PASSWORD` | DevOps | worker |
| Claves de integraciones externas | Backend | api, worker segun integracion |

## Politica de rotacion minima
- Secretos de BD: rotar al menos cada 90 dias en prod o ante cualquier sospecha de exposicion.
- JWT secrets: rotar ante cambio de personal con acceso o ante incidente.
- Claves de API externas: seguir la politica del proveedor; minimo revision trimestral.
- Toda rotacion debe auditarse (fecha, quien rotó, motivo).

## Restricciones de codigo
- Prohibido usar valores de secretos como literales en codigo fuente.
- Prohibido loggear variables de entorno completas al arranque (solo confirmar presencia, no valor).
- Prohibido exponer secretos con prefijo `VITE_` u otro prefijo de cliente web.

## Referencia a implementacion concreta
La implementacion de validacion de secretos en cada app se formaliza en las tasks de la Fase 3 (`T-0331` a `T-0334`). Este documento define solo la politica y los principios.
