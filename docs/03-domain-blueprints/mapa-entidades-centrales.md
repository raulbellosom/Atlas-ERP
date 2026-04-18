# Mapa de Entidades Centrales Compartidas

## Propósito
Documentar las entidades del Core Platform que son compartidas por todos los módulos de negocio actuales y futuros.

## Entidades del Core Platform

### Organization
Representa una empresa o unidad organizacional. Es el tenant raíz del sistema.

```
Organization {
  id          String    @id
  name        String
  slug        String    @unique
  isActive    Boolean   @default(true)
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime? // soft delete
}
```

**Relaciones:** todos los módulos de negocio tienen una clave foránea a `Organization.id`.

### User
Persona que opera el sistema dentro de una organización.

```
User {
  id             String    @id
  organizationId String
  email          String    @unique
  displayName    String
  isActive       Boolean   @default(true)
  createdAt      DateTime
  updatedAt      DateTime
  deletedAt      DateTime?
}
```

### Role y Permission
Sistema de control de acceso basado en roles.

```
Role {
  id             String
  organizationId String
  name           String    // ej. 'admin', 'tesorero', 'auditor'
  description    String?
}

Permission {
  id      String
  key     String    @unique  // ej. 'financial:bank_account:create'
  module  String
  action  String
}

RolePermission {
  roleId       String
  permissionId String
  // PK compuesta
}

UserRole {
  userId String
  roleId String
}
```

### AuditLog
Ver `docs/03-domain-blueprints/blueprint-tecnico-auditoria.md`

### Attachment
Ver `docs/03-domain-blueprints/blueprint-tecnico-adjuntos.md`

### Setting
Configuración clave-valor por organización o global.

```
Setting {
  id             String
  organizationId String?   // null = global
  key            String
  value          String    // JSON string
  updatedAt      DateTime
}
```

### FeatureFlag / FeatureFlagOverride
Ver `docs/03-domain-blueprints/blueprint-tecnico-feature-flags.md`

## Regla de uso
Ningún módulo de negocio replica estas entidades. Solo las referencia via clave foránea o via el servicio del módulo correspondiente. No se accede directamente a la tabla `User` desde el módulo `financial`, por ejemplo — se usa el `UsersService` del módulo `auth/users`.
