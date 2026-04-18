# Blueprint Técnico: Observabilidad

## Identificación
- Aplica a: `apps/api`, `apps/worker`, `apps/web`, `apps/desktop`
- Herramientas: a definir en Fase 4+ según infraestructura

## Propósito
Definir qué se observa del sistema en ejecución: logs, métricas y trazas que permiten detectar problemas antes de que los usuarios los reporten.

## Los tres pilares de observabilidad

### 1. Logs
Ver `docs/02-architecture/14-estrategia-logs.md` para la política completa.

Herramientas de recolección (a confirmar en Fase 4):
- Self-hosted: Loki + Grafana
- Managed: Datadog, CloudWatch

### 2. Métricas
Indicadores clave a monitorear:

| Métrica | Umbral de alerta sugerido |
|---------|--------------------------|
| Latencia P95 de endpoints críticos | > 1000ms |
| Tasa de errores HTTP 5xx | > 1% de requests |
| Tiempo de procesamiento de jobs | > 30s por job |
| Cola de sync pendiente | > 100 ítems acumulados |
| Uso de CPU/Memoria del API | > 80% sostenido 5 min |
| Tamaño de base de datos | Crecimiento anormal en 24h |

Herramientas (a confirmar en Fase 4):
- Self-hosted: Prometheus + Grafana
- Managed: Datadog, New Relic

### 3. Trazas distribuidas
- Las trazas permiten seguir una request desde el cliente hasta la base de datos.
- En Fase 6+ se implementará `@nestjs/terminus` para health checks y OpenTelemetry para trazas.

## Health checks obligatorios

El endpoint `/health` del API debe verificar:
- Conexión a PostgreSQL
- Conexión a Redis
- Conexión a MinIO
- Estado del worker (jobs procesándose, sin bloqueos)

## Alertas mínimas para producción
- Error 5xx sostenido > 1 minuto → alerta crítica
- Base de datos no responde → alerta crítica
- Cola de sync sin procesar > 1 hora → alerta de aviso
- Backup no ejecutado en ventana esperada → alerta de aviso
