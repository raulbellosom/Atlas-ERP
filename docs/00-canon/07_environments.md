# Canon: Estrategia de Environments

## Principios no negociables

- La plataforma opera siempre en uno de cuatro ambientes: `development`, `test`, `staging`, `production`.
- Ninguna configuración de ambiente se hardcodea en código fuente.
- Cada ambiente tiene su propio conjunto de variables de entorno, base de datos y servicios.
- La progresión de código es unidireccional: `dev → staging → production`. No se despliega directo a producción desde una rama de feature.

## Definición de ambientes

| Ambiente | Propósito | Base de datos | Quién lo usa |
|----------|-----------|---------------|--------------|
| `development` | Trabajo diario de desarrolladores | PostgreSQL local (Docker) | Equipo de desarrollo |
| `test` | Pruebas automatizadas | PostgreSQL efímera o en memoria | CI/CD pipeline |
| `staging` | Validación pre-producción | PostgreSQL staging (servidor) | QA, stakeholders |
| `production` | Operación real | PostgreSQL producción (servidor) | Usuarios finales |

## Separación de servicios por ambiente

- Cada ambiente tiene su propia instancia de PostgreSQL, Redis y MinIO.
- Los ambientes no comparten datos entre sí.
- Las credenciales de producción nunca se usan en desarrollo o staging.

## Sincronización de configuración

- Toda variable de entorno nueva debe agregarse al `.env.example` correspondiente antes de usar.
- Los cambios de configuración entre ambientes deben documentarse en la PR o en el CHANGELOG.

## Referencia a estrategias relacionadas
- Variables de entorno: `docs/02-architecture/10-estrategia-environment-variables.md`
- Secretos: `docs/02-architecture/11-estrategia-secretos.md`
- CI/CD: `docs/00-canon/08_cicd_despliegue.md`
