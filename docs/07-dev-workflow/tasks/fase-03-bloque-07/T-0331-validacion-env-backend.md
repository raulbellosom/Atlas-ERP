# T-0331 - Crear validación de env vars en backend

## Metadatos
- ID: `T-0331`
- Fase: `Fase 3`
- Bloque: `Bloque 7`
- Estado: `closed`
- Fecha de cierre: `2026-04-12`
- Agente responsable: `BackendAPIAgent`

## Objetivo
Implementar la validacion de variables de entorno en el arranque del backend NestJS usando class-validator y class-transformer, en conformidad con el principio canon "fail fast".

## Criterios de aceptación
- [x] `apps/api/src/config/env.validation.ts` creado con clase `EnvironmentVariables`.
- [x] Variables obligatorias: DATABASE_URL, REDIS_HOST, REDIS_PORT, S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET, JWT_SECRET, NODE_ENV.
- [x] Variables opcionales: S3_REGION, JWT_EXPIRES_IN, PORT.
- [x] Funcion `validateEnv` exportada — compatible con `ConfigModule.forRoot({ validate })`.
- [x] Error descriptivo en espanol si falta variable obligatoria.
- [x] `enableImplicitConversion: true` — convierte REDIS_PORT (string) a number automaticamente.

## Archivos creados
- `apps/api/src/config/env.validation.ts`

## Integracion con NestJS (Fase 6)

```typescript
// En AppModule (Fase 6):
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
  ],
})
export class AppModule {}
```

## Decisiones tecnicas
- **`class-validator` + `class-transformer`**: Compatibles con NestJS ConfigModule.
- **`plainToInstance` con conversion implicita**: Permite usar variables de entorno (siempre strings) con tipos number/boolean sin conversiones manuales.
- **Mensaje de error en espanol**: Consistente con el idioma del proyecto (MX).
- **`IsUrl({ require_tld: false })`**: Permite URLs locales como `http://localhost:9000`.

## Pendientes no resueltos
- La integracion real con `ConfigModule.forRoot` se hace en Fase 6 al crear AppModule.
