import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { WorkerEvents, logger } from '../logger';

const TASK_EVENTS_CHANNEL = 'atlaserp.tasks.events';

type TaskEvent = {
  eventId?: string;
  eventType?: string;
  taskId?: string;
  taskKey?: string;
  organizationId?: string | null;
  changedByUserId?: string | null;
  changedAt?: string;
  payload?: Record<string, unknown>;
};

@Injectable()
export class TaskEventsSubscriberService implements OnModuleInit, OnModuleDestroy {
  private subscriber: Redis | null = null;
  private readonly counters = new Map<string, number>();
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');
    const password = this.configService.get<string>('REDIS_PASSWORD');

    if (!host || !port) {
      logger.warn(
        {
          event: WorkerEvents.JOB_FAILED,
          module: 'tasks-subscriber',
        },
        'REDIS_HOST/REDIS_PORT no configurados; suscriptor de tasks deshabilitado',
      );
      return;
    }

    this.subscriber = new Redis({
      host,
      port,
      password: password || undefined,
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
    });

    this.subscriber.on('message', (channel: string, message: string) => {
      if (channel !== TASK_EVENTS_CHANNEL) {
        return;
      }
      this.handleMessage(message);
    });

    await this.subscriber.subscribe(TASK_EVENTS_CHANNEL);

    this.flushTimer = setInterval(() => {
      this.flushMetrics();
    }, 60_000);

    logger.info(
      {
        event: WorkerEvents.JOB_STARTED,
        module: 'tasks-subscriber',
        channel: TASK_EVENTS_CHANNEL,
      },
      'Suscriptor de eventos de tasks iniciado',
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    this.flushMetrics();

    if (this.subscriber) {
      await this.subscriber.unsubscribe(TASK_EVENTS_CHANNEL).catch(() => undefined);
      await this.subscriber.quit().catch(() => undefined);
      this.subscriber = null;
    }
  }

  private handleMessage(rawMessage: string): void {
    let event: TaskEvent;

    try {
      event = JSON.parse(rawMessage) as TaskEvent;
    } catch {
      logger.warn(
        {
          event: WorkerEvents.JOB_FAILED,
          module: 'tasks-subscriber',
          reason: 'invalid_json',
        },
        'Evento de task descartado por payload invalido',
      );
      return;
    }

    const eventType = event.eventType ?? 'UNKNOWN';
    this.incrementCounter(eventType);

    logger.info(
      {
        event: WorkerEvents.JOB_ENQUEUED,
        module: 'tasks-subscriber',
        taskEventType: eventType,
        taskId: event.taskId ?? null,
        taskKey: event.taskKey ?? null,
        organizationId: event.organizationId ?? null,
      },
      'Evento de task recibido para telemetria futura',
    );
  }

  private incrementCounter(eventType: string): void {
    const current = this.counters.get(eventType) ?? 0;
    this.counters.set(eventType, current + 1);
  }

  private flushMetrics(): void {
    if (this.counters.size === 0) return;

    const metrics = Array.from(this.counters.entries()).map(([eventType, count]) => ({
      eventType,
      count,
    }));
    this.counters.clear();

    logger.info(
      {
        event: WorkerEvents.JOB_COMPLETED,
        module: 'tasks-subscriber',
        channel: TASK_EVENTS_CHANNEL,
        metrics,
      },
      'Resumen de throughput de eventos de tasks',
    );
  }
}
