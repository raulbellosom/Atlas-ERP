# Blueprint Técnico: Worker / Jobs

## Identificación
- Aplicación: `apps/worker`
- Tecnologías: NestJS + TypeScript + Bull/BullMQ + Redis
- Modo: proceso independiente de jobs asíncronos

## Propósito
Proceso separado del backend API encargado de tareas asíncronas, colas de trabajo y procesamiento diferido. No maneja requests HTTP directos del cliente.

## Responsabilidades principales

| Responsabilidad | Descripción |
|----------------|-------------|
| Procesamiento de sync | Recibe ítems de la cola de sync del servidor y los aplica |
| Envío de correos | Notificaciones por email a usuarios |
| Generación de reportes | Exportaciones pesadas que no deben bloquear el API |
| Limpieza de datos | Purga de logs, tokens expirados, datos temporales |
| Jobs programados (cron) | Tareas periódicas: conciliaciones automáticas, recordatorios |

## Estructura de módulos

```
apps/worker/src/
├─ main.ts
├─ app.module.ts
├─ config/
├─ queues/              # Definición de colas Bull
│  ├─ sync.queue.ts
│  ├─ email.queue.ts
│  └─ report.queue.ts
├─ processors/          # Procesadores de jobs por cola
│  ├─ sync.processor.ts
│  ├─ email.processor.ts
│  └─ report.processor.ts
└─ schedulers/          # Jobs periódicos (cron)
```

## Relación con el backend API

- El API encola jobs en Redis via BullMQ; el worker los consume.
- Comparten acceso a PostgreSQL (misma base de datos).
- No comparten código de controladores o DTOs HTTP — solo servicios de dominio compartibles.

## Manejo de fallos

- Los jobs fallidos se reintentan según la configuración de la cola (backoff exponencial).
- Después de N reintentos, el job pasa a la cola de muertos (`dead letter queue`).
- Los jobs de sync fallidos generan un registro de conflicto en la tabla correspondiente.

## Variables de entorno relevantes
- `REDIS_URL` — conexión a Redis para las colas
- `DATABASE_URL` — acceso a PostgreSQL
- `WORKER_CONCURRENCY` — número de jobs paralelos por cola
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` — para envío de correo
