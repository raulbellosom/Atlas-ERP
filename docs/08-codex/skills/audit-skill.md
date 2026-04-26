# Audit Skill

## ID de task origen

- `T-0128`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Objetivo

Guiar la implementación de auditoría en AtlasERP para operaciones críticas.

## Procedimiento

### 1. Cuándo auditar

- Creación de entidades de negocio.
- Actualización de datos sensibles.
- Eliminación (incluyendo soft delete).
- Login, logout, refresh de sesión.
- Cambios de roles o permisos de usuario.
- Operaciones de sincronización.
- Resolución de conflictos.
- Exportaciones de datos.
- Acceso a información sensible.

### 2. Campos obligatorios del AuditLog

```
actor       String    — ID del usuario que ejecuta la acción.
action      String    — Tipo de acción (CREATE, UPDATE, DELETE, LOGIN, SYNC, RESOLVE, EXPORT).
entityType  String    — Tipo de entidad afectada (BankAccount, User, etc.).
entityId    String    — ID de la entidad afectada.
origin      String    — Origen de la acción (WEB, DESKTOP, API, SYNC, SYSTEM).
timestamp   DateTime  — Momento exacto de la acción.
before      Json?     — Estado previo del registro (para updates y deletes).
after       Json?     — Estado posterior del registro (para creates y updates).
result      String    — Resultado (SUCCESS, FAILURE, PARTIAL).
metadata    Json?     — Datos adicionales contextuales.
organizationId String — Organización a la que pertenece el registro.
```

### 3. Implementación backend

- Servicio de auditoría centralizado (`AuditService`).
- Llamado desde servicios de negocio después de ejecutar la operación.
- No bloquear la operación principal si el audit falla (registrar error).
- Considerar interceptor automático para operaciones CRUD estándar.

### 4. Consulta de auditoría

- Endpoint paginado de consulta.
- Filtros por: actor, action, entityType, entityId, rango de fechas, origin.
- Solo accesible por roles con permiso de auditoría.

### 5. Restricciones

- Los registros de auditoría son inmutables (no se editan ni eliminan).
- No auditar lecturas simples (evitar ruido).
- No incluir datos sensibles sin máscara (contraseñas, tokens).

## Referencia

- `docs/00-canon/06_security_and_audit.md`
