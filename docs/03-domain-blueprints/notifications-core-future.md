# Notifications Core Blueprint (Future)

## Propósito
Gestionar notificaciones internas del sistema hacia usuarios: alertas de sync, confirmaciones de operación, recordatorios y avisos de módulos activos.

## Alcance futuro
Este módulo es transversal: puede activarse una vez que existan módulos de negocio operativos que generen eventos. Requiere blueprint técnico aprobado antes de iniciar.

## Entidades futuras
- `Notification` — notificación individual dirigida a un usuario
- `NotificationChannel` — canal de entrega (in-app, email, push)
- `NotificationTemplate` — plantilla de mensaje por tipo de evento
- `NotificationPreference` — preferencias de notificación por usuario

## Fuentes de notificaciones esperadas
- Sync Core: conflictos detectados, sincronizaciones completadas
- Financial Operations Core: movimientos pendientes de aprobación, conciliaciones
- Cualquier módulo futuro que emita eventos relevantes para el usuario

## Política de sync
- Las notificaciones in-app se sincronizan al reconectar.
- Las notificaciones por email/push se envían desde el worker, no desde el cliente.
- El estado de lectura se sincroniza con cola local.

## Requisitos previos para construirlo
- Al menos un módulo de negocio operativo que emita eventos.
- Blueprint funcional y técnico de Notifications Core aprobados.
- Decisión sobre canales de entrega soportados documentada en ADR.

## Estado
`futuro` — No iniciar sin blueprint técnico aprobado.
