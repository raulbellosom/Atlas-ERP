# Esquema de Payload de Sync

## ID de definición
- Task origen: `T-1003`
- Estado: `aprobada`
- Fecha: `2026-04-13`

## Estructura base

```json
{
  "version": "1.0.0",
  "requestId": "req_123",
  "sentAt": "2026-04-13T21:10:00.000Z",
  "client": {
    "deviceId": "device_abc",
    "appVersion": "0.1.0",
    "platform": "desktop",
    "organizationId": "org_001",
    "branchId": "branch_001",
    "userId": "user_001"
  },
  "batch": {
    "totalItems": 1,
    "items": [
      {
        "itemId": "item_001",
        "idempotencyKey": "idem_001",
        "entity": "financial_movement",
        "operation": "create",
        "entityId": "mov_001",
        "occurredAt": "2026-04-13T21:09:45.000Z",
        "source": "desktop",
        "payload": {
          "amount": 1000,
          "currency": "MXN"
        }
      }
    ]
  }
}
```

## Campos requeridos por item
- `itemId`
- `idempotencyKey`
- `entity`
- `operation`
- `entityId`
- `occurredAt`
- `source`
- `payload`

## Fuente técnica
- `packages/sync-contracts/src/payload.js`
