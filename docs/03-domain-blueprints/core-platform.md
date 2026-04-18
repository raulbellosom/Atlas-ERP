# Core Platform Blueprint

## Propósito
Dar la base transversal para todos los módulos del sistema.

## Entidades iniciales
- Organization
- Branch
- User
- Role
- Permission
- Attachment
- AuditLog
- Setting

## Relaciones clave
- Organization tiene muchas Branches
- Organization tiene muchos Users
- User puede tener múltiples Roles
- Role agrupa múltiples Permissions
- Attachments pueden ligarse a muchas entidades por referencia polimórfica o modelo explícito
- AuditLog puede apuntar a cualquier entidad crítica

## Futuro
Todos los módulos deben depender de este núcleo y no duplicar usuarios, organizaciones o permisos.

