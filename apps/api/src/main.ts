import { Logger, ValidationPipe, type LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AppModule } from './modules/app/app.module';

/**
 * Niveles de log segun el ambiente.
 * Principio canon: debug solo en development — no inundar logs de prod.
 */
export function getLogLevels(): LogLevel[] {
  const nodeEnv = process.env['NODE_ENV'] ?? 'development';
  if (nodeEnv === 'test') {
    return ['warn', 'error'];
  }
  if (nodeEnv === 'production') {
    return ['log', 'warn', 'error'];
  }
  // development: todos los niveles
  return ['log', 'debug', 'verbose', 'warn', 'error'];
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));

  const configService = app.get(ConfigService);

  // Habilitar CORS para permitir peticiones desde el frontend (Vite/React)
  app.enableCors({
    origin: true, // Refleja el origen de la peticion, permitiendo localhost:5173
    credentials: true,
  });

  // Filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // Interceptor global de transformacion de respuestas
  app.useGlobalInterceptors(new TransformInterceptor());

  // Validation pipe global — fail fast en DTOs invalidos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip propiedades sin decoradores
      forbidNonWhitelisted: true, // error si llegan propiedades extra
      transform: true, // convierte payloads al tipo del DTO
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  app.setGlobalPrefix(apiPrefix);

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);

  Logger.log(`API corriendo en http://localhost:${port}/${apiPrefix}`, 'Bootstrap');
}

void bootstrap();
