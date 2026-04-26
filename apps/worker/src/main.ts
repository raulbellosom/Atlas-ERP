import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WorkerEvents, logger } from './logger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  // Mantener proceso vivo hasta tener procesadores BullMQ reales conectados.
  const keepAliveTimer = setInterval(() => {
    // no-op
  }, 60_000);

  logger.info(
    {
      event: WorkerEvents.WORKER_STARTED,
      nodeEnv: process.env['NODE_ENV'] ?? 'development',
    },
    'AtlasERP worker iniciado',
  );

  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(
      { event: WorkerEvents.WORKER_STOPPING, signal },
      'Cerrando worker de forma segura',
    );

    clearInterval(keepAliveTimer);
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void gracefulShutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void gracefulShutdown('SIGTERM');
  });
}

void bootstrap().catch((error: unknown) => {
  console.error('[AtlasERP Worker] Error al iniciar:', error);
  process.exit(1);
});
