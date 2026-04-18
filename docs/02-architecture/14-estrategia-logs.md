# Estrategia de Logs Funcionales y Tecnicos

## ID de estrategia
- Task origen: `T-0044`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo
Definir que se loggea, como se clasifica, que niveles se usan, cuanto se retiene y que esta prohibido registrar, separando claramente los logs tecnicos de los logs funcionales.

## Tipos de log

### Logs tecnicos
Capturan el comportamiento del sistema como plataforma de software. Son para el equipo tecnico.

Ejemplos:
- Arranque y parada de servicios (api, worker, desktop)
- Errores no controlados y excepciones
- Requests HTTP: metodo, ruta, status code, duracion (sin body ni headers sensibles)
- Tiempos de respuesta de queries lentas (sin datos de usuario)
- Reintentos de jobs fallidos en la cola del worker
- Conexiones a servicios externos (exito o falla, sin credenciales)

### Logs funcionales
Capturan acciones de usuario o procesos de negocio con impacto en datos. Son para rastreo operativo.
No son lo mismo que la auditoria formal: la auditoria es inmutable y pertenece al modulo de Audit; los logs funcionales son operativos y rotativos.

Ejemplos:
- Inicio/cierre de sesion de usuario (ID de usuario, timestamp, IP hasheada)
- Creacion, modificacion o eliminacion de entidades clave (ID de entidad, accion, usuario)
- Inicio y resultado de procesos de sincronizacion
- Resolucion de conflictos (accion tomada, usuario, timestamp)
- Exportaciones o reportes generados

## Niveles de log

| Nivel | Uso | Ambientes activos |
|-------|-----|------------------|
| `debug` | Informacion detallada de flujo interno, util solo en desarrollo | Solo `dev` |
| `info` | Eventos normales de operacion que conviene registrar | `dev`, `staging`, `prod` |
| `warn` | Situaciones anómalas que no interrumpen el flujo pero merecen atencion | `dev`, `staging`, `prod` |
| `error` | Fallos que interrumpen un flujo o requieren intervencion | `dev`, `staging`, `prod` |

En `prod`, el nivel `debug` debe estar desactivado por defecto.

## Retencion minima

| Tipo | Produccion | Staging | Desarrollo |
|------|-----------|---------|-----------|
| Logs tecnicos | 30 dias | 14 dias | 7 dias |
| Logs funcionales | 60 dias | 14 dias | 7 dias |

Pasada la retencion, los logs pueden archivarse o eliminarse segun politica de almacenamiento.

## Prohibiciones absolutas
- Prohibido loggear contrasenas, tokens, secretos o claves de API (ni parcialmente).
- Prohibido loggear el body completo de requests HTTP en prod (puede contener datos sensibles).
- Prohibido loggear datos personales identificables (nombre completo, CURP, RFC) en logs tecnicos.
- Prohibido usar `console.log` en codigo de produccion del backend; usar el logger del framework.

## Separacion de responsabilidades
- Los logs tecnicos son responsabilidad de DevOps para su recoleccion y rotacion.
- Los logs funcionales son responsabilidad del equipo de backend para garantizar su completitud.
- La auditoria formal (inmutable, por modulo de Audit) es responsabilidad del modulo `audit` y no se reemplaza con logs.

## Formato recomendado
- Formato estructurado: JSON cuando el destino sea un agregador (Loki, CloudWatch, Datadog, etc.).
- Formato legible: texto con timestamp ISO 8601 cuando el destino sea consola de desarrollo.
- Cada entrada debe incluir: `timestamp`, `level`, `service`, `message`, y contexto relevante (ej. `userId`, `requestId`).

## Nota de implementacion
La configuracion concreta del logger por aplicacion se implementa en Fase 6 (`T-0600+`) para el backend y en Fase 7 para el frontend y desktop. Este documento define la politica que debe cumplir cualquier implementacion.
