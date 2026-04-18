# T-0409 - Configurar contenedor del worker

## Metadatos
- ID: `T-0409`
- Fase: `Fase 4`
- Bloque: `Bloque 1`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `DevOpsCIAgent`

## Objetivo
Documentar y materializar la configuracion completa del contenedor del servicio worker de NestJS en staging y produccion: imagen, variables de entorno, dependencias de servicio y diferencias respecto a la API.

## Criterios de aceptacion
- [x] Imagen versionada: `atlasrep/worker:${IMAGE_TAG:-latest}`.
- [x] Variables de entorno: DATABASE_URL, REDIS_*, S3_*, NODE_ENV (sin JWT ni PORT).
- [x] `depends_on` con `condition: service_healthy` para postgres y redis.
- [x] Sin healthcheck propio: el worker es un proceso de cola, no un servidor HTTP.
- [x] Sin puerto expuesto: el worker no recibe requests directos.
- [x] Red interna `atlasrep-internal` para acceso a postgres, redis y minio.
- [x] `NODE_ENV: production` en staging y prod.

## Archivos modificados
- Configuracion ya materializada en docker-compose.staging.yml y docker-compose.prod.yml.

## Configuracion del contenedor

### Imagen
```yaml
image: atlasrep/worker:${IMAGE_TAG:-latest}
```
- Mismo tag que el servicio API para mantener coherencia de version.

### Variables de entorno
```yaml
environment:
  DATABASE_URL: ${DATABASE_URL}
  REDIS_HOST: redis
  REDIS_PORT: 6379
  REDIS_PASSWORD: ${REDIS_PASSWORD}
  S3_ENDPOINT: http://minio:9000
  S3_ACCESS_KEY: ${S3_ACCESS_KEY}
  S3_SECRET_KEY: ${S3_SECRET_KEY}
  S3_BUCKET: ${S3_BUCKET}
  NODE_ENV: production
```

**Diferencias vs API**:
- Sin `JWT_SECRET` / `JWT_EXPIRES_IN`: el worker no autentica usuarios.
- Sin `PORT`: el worker no levanta servidor HTTP.

### Dependencias
```yaml
depends_on:
  postgres:
    condition: service_healthy
  redis:
    condition: service_healthy
```
- El worker requiere Redis para consumir jobs de BullMQ.
- El worker requiere PostgreSQL para leer/escribir datos de negocio.

### Sin healthcheck
El worker es un proceso de cola largo-corriente (long-running) que escucha jobs de BullMQ.
No expone endpoints HTTP, por lo que no tiene healthcheck de Docker.
La supervision se hace via logging y metricas de BullMQ en Fase 5+.

## Responsabilidades del worker

| Job                    | Descripcion                                               |
| ---------------------- | --------------------------------------------------------- |
| Generacion de reportes | PDF/XLSX de compras, ventas, inventario                   |
| Envio de emails        | Notificaciones, confirmaciones, alertas                   |
| Sync de escritorio     | Procesamiento de eventos de sincronizacion SQLite         |
| Limpieza programada    | Expirar exports viejos, limpiar tokens caducados          |
| Procesamiento de archivos | Validar y procesar adjuntos subidos a MinIO            |

## Diferencias vs API

| Aspecto              | API                            | Worker                              |
| -------------------- | ------------------------------ | ----------------------------------- |
| Tipo de proceso      | Servidor HTTP (NestJS)         | Proceso de cola (BullMQ consumer)   |
| Puerto               | 3000 (interno)                 | Sin puerto                          |
| Healthcheck          | `GET /api/health`              | Sin healthcheck HTTP                |
| JWT                  | Si (autentica requests)        | No (no recibe requests directos)    |
| Ciclo de vida        | Request/response               | Job queue consumer loop             |

## Decisiones tecnicas
- **Imagen separada de la API**: permite escalar workers independientemente y desplegar sin afectar la API.
- **Sin HTTP server**: el worker no debe responder requests; cualquier job se envia via BullMQ desde la API.
- **Mismo IMAGE_TAG**: garantiza coherencia entre API y worker en cada deploy (misma version de schema Prisma, mismos tipos compartidos).

## Pendientes no resueltos
- Dockerfile del worker — se crea en T-0416.
- Implementacion de BullMQ queues y jobs — se hace en Fase 5.
- Metricas y alertas de jobs fallidos — Fase 5+.
