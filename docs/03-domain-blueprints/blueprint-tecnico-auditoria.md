# Blueprint Técnico: Auditoría

## Identificación
- Módulo backend: `apps/api/src/modules/audit/`
- Entidad central: `AuditLog`

## Propósito
Registrar de forma inmutable toda acción crítica del sistema: quién hizo qué, cuándo, sobre qué entidad y con qué resultado.

## Principios

- El registro de auditoría es **inmutable**: no se actualiza ni elimina una vez creado.
- La auditoría se registra **después** de que la operación fue exitosa, no antes.
- La auditoría NO es un log técnico — es un registro de negocio.
- El `AuditService` es el único punto de escritura de auditoría.

## Entidad `AuditLog`

```
AuditLog {
  id          String    @id @default(uuid())
  userId      String    // quien ejecutó la acción (null si fue sistema)
  action      String    // ej. 'bank_account.created', 'transaction.deleted'
  entity      String    // nombre del modelo afectado
  entityId    String    // ID del registro afectado
  before      Json?     // estado anterior (null si es creación)
  after       Json?     // estado posterior (null si es eliminación)
  metadata    Json?     // contexto adicional (IP, device, sync session, etc.)
  createdAt   DateTime  @default(now())
}
```

## Convención de naming de acciones

`<módulo>.<entidad>.<acción>`

Ejemplos:
- `financial.bank_account.created`
- `financial.transaction.updated`
- `financial.transaction.deleted`
- `auth.session.login`
- `sync.conflict.resolved`
- `users.user.role_changed`

## Qué siempre se audita

- Creación, modificación y eliminación de entidades de negocio críticas
- Cambios de rol o permisos de usuario
- Inicio y cierre de sesión
- Resolución de conflictos de sync
- Aprobación o rechazo de operaciones financieras
- Cambios en configuración del sistema

## Qué NO se audita

- Lecturas (GET) — solo escrituras
- Eventos técnicos de infraestructura (logs técnicos los cubren)
- Operaciones de cache o snapshots locales

## Integración en servicios

```typescript
// Ejemplo de uso en un service
async createBankAccount(dto: CreateBankAccountDto, userId: string) {
  const account = await this.prisma.bankAccount.create({ data: dto });
  await this.auditService.log({
    userId,
    action: 'financial.bank_account.created',
    entity: 'BankAccount',
    entityId: account.id,
    after: account,
  });
  return account;
}
```
