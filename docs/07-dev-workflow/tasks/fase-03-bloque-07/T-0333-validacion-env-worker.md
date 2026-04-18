# T-0333 - Crear validación de env vars en worker

## Metadatos
- ID: `T-0333`
- Fase: `Fase 3`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Implementar la validacion de variables de entorno en el arranque del worker NestJS (apps/worker), identica en patron a la del backend API.

## Criterios de aceptación
- [x] `apps/worker/src/config/env.validation.ts` creado con clase `WorkerEnvironmentVariables`.
- [x] Variables obligatorias: DATABASE_URL, REDIS_HOST, REDIS_PORT, S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET, NODE_ENV.
- [x] Variables opcionales: S3_REGION.
- [x] Funcion `validateEnv` exportada — compatible con `ConfigModule.forRoot({ validate })`.
- [x] Error con prefijo `[AtlasERP Worker]` para distinguirlo del error del API.

## Archivos creados
- `apps/worker/src/config/env.validation.ts`

## Diferencias respecto a API

| Variable      | API | Worker | Motivo                                    |
| ------------- | --- | ------ | ----------------------------------------- |
| JWT_SECRET    | Si  | No     | Worker no emite tokens — solo procesa jobs |
| JWT_EXPIRES_IN | Si | No    | Idem                                      |
| PORT          | Si  | No     | Worker no expone HTTP — solo colas BullMQ |

## Integracion (Fase 6)

```typescript
// En WorkerModule:
ConfigModule.forRoot({ validate: validateEnv, isGlobal: true })
```

## Pendientes no resueltos
- Ninguno. Integracion real en Fase 6 al crear WorkerModule.
