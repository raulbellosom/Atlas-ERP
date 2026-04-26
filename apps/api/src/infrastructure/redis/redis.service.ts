import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

type RedisMessageHandler = (message: string) => void;

@Injectable()
export class RedisPubSubService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisPubSubService.name);
  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;
  private readonly handlersByChannel = new Map<string, Set<RedisMessageHandler>>();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');
    const password = this.configService.get<string>('REDIS_PASSWORD');

    if (!host || !port) {
      this.logger.warn('REDIS_HOST/REDIS_PORT no configurados. PubSub Redis deshabilitado.');
      return;
    }

    this.publisher = new Redis({
      host,
      port,
      password: password || undefined,
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
    });
    this.subscriber = new Redis({
      host,
      port,
      password: password || undefined,
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
    });

    this.subscriber.on('message', (channel: string, message: string) => {
      const handlers = this.handlersByChannel.get(channel);
      if (!handlers || handlers.size === 0) {
        return;
      }
      for (const handler of handlers) {
        try {
          handler(message);
        } catch (error) {
          this.logger.error(
            `Error al procesar mensaje Redis de ${channel}: ${(error as Error).message}`,
          );
        }
      }
    });
  }

  async publish(channel: string, payload: string): Promise<void> {
    if (!this.publisher) {
      return;
    }
    await this.publisher.publish(channel, payload);
  }

  async subscribe(channel: string, handler: RedisMessageHandler): Promise<void> {
    if (!this.subscriber) {
      return;
    }

    let handlers = this.handlersByChannel.get(channel);
    if (!handlers) {
      handlers = new Set<RedisMessageHandler>();
      this.handlersByChannel.set(channel, handlers);
      await this.subscriber.subscribe(channel);
    }
    handlers.add(handler);
  }

  async unsubscribe(channel: string, handler: RedisMessageHandler): Promise<void> {
    if (!this.subscriber) {
      return;
    }

    const handlers = this.handlersByChannel.get(channel);
    if (!handlers) {
      return;
    }

    handlers.delete(handler);
    if (handlers.size === 0) {
      this.handlersByChannel.delete(channel);
      await this.subscriber.unsubscribe(channel);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([
      this.publisher?.quit().catch(() => undefined),
      this.subscriber?.quit().catch(() => undefined),
    ]);
    this.publisher = null;
    this.subscriber = null;
    this.handlersByChannel.clear();
  }
}
