import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { OutboundEmailJobStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import nodemailer from 'nodemailer';
import { PrismaService } from '../infrastructure/prisma.service';
import { WorkerEvents, logger } from '../logger';

const OUTBOUND_EMAIL_JOBS_CHANNEL = 'atlaserp.outbound-email.jobs';
const EMAIL_OUTBOUND_SETTING_KEY = 'platform.email.outbound';
const EMAIL_OUTBOUND_HEALTH_SETTING_KEY = 'platform.email.outbound.health';

type EmailOutboundConfig = {
  provider: 'smtp';
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  timeoutMs: number;
  isActive: boolean;
};

@Injectable()
export class OutboundEmailWorkerService implements OnModuleInit, OnModuleDestroy {
  private subscriber: Redis | null = null;
  private pollTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    logger.info(
      { event: WorkerEvents.JOB_STARTED, module: 'outbound-email' },
      'OutboundEmailWorker onModuleInit iniciando...',
    );

    await this.tryConnectRedisSubscriber();

    this.pollTimer = setInterval(() => {
      void this.processQueue();
    }, 10_000);

    logger.info(
      { event: WorkerEvents.JOB_STARTED, module: 'outbound-email' },
      'Poll timer configurado (10s), ejecutando primer processQueue...',
    );
    void this.processQueue();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    if (this.subscriber) {
      await this.subscriber.unsubscribe(OUTBOUND_EMAIL_JOBS_CHANNEL).catch(() => undefined);
      await this.subscriber.quit().catch(() => undefined);
      this.subscriber = null;
    }
  }

  private async tryConnectRedisSubscriber(): Promise<void> {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');
    const password = this.configService.get<string>('REDIS_PASSWORD');

    if (!host || !port) {
      logger.warn(
        { event: WorkerEvents.JOB_FAILED, module: 'outbound-email' },
        'REDIS_HOST/REDIS_PORT no configurados; trigger por pubsub deshabilitado para correo',
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

    this.subscriber.on('message', (_channel: string, _message: string) => {
      void this.processQueue();
    });

    await this.subscriber.subscribe(OUTBOUND_EMAIL_JOBS_CHANNEL);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      logger.debug(
        { event: WorkerEvents.JOB_STARTED, module: 'outbound-email' },
        'processQueue omitido: ya esta procesando',
      );
      return;
    }
    this.isProcessing = true;

    try {
      const config = await this.getEmailConfig();
      if (!config || !config.isActive) {
        logger.debug(
          {
            event: WorkerEvents.JOB_STARTED,
            module: 'outbound-email',
            configNull: !config,
            isActive: config?.isActive,
          },
          'processQueue omitido: config nula o inactiva',
        );
        return;
      }

      const jobs = await this.prisma.outboundEmailJob.findMany({
        where: {
          status: { in: [OutboundEmailJobStatus.PENDING, OutboundEmailJobStatus.FAILED] },
          nextAttemptAt: { lte: new Date() },
        },
        orderBy: [{ nextAttemptAt: 'asc' }, { createdAt: 'asc' }],
        take: 10,
      });

      if (jobs.length > 0) {
        logger.info(
          { event: WorkerEvents.JOB_STARTED, module: 'outbound-email', jobCount: jobs.length },
          `processQueue: ${jobs.length} job(s) pendientes encontrados`,
        );
      } else {
        logger.debug(
          { event: WorkerEvents.JOB_STARTED, module: 'outbound-email', jobCount: 0 },
          `processQueue: 0 job(s) pendientes encontrados`,
        );
      }

      for (const job of jobs) {
        await this.processSingleJob(job.id, config);
      }
    } catch (error) {
      logger.error(
        {
          event: WorkerEvents.JOB_FAILED,
          module: 'outbound-email',
          error: error instanceof Error ? error.message : String(error),
        },
        'Error al procesar cola de correos',
      );
    } finally {
      this.isProcessing = false;
    }
  }

  private async processSingleJob(jobId: string, config: EmailOutboundConfig): Promise<void> {
    const now = new Date();

    const claimed = await this.prisma.outboundEmailJob.updateMany({
      where: {
        id: jobId,
        status: { in: [OutboundEmailJobStatus.PENDING, OutboundEmailJobStatus.FAILED] },
      },
      data: {
        status: OutboundEmailJobStatus.PROCESSING,
        lockedAt: now,
      },
    });

    if (claimed.count === 0) {
      return;
    }

    const job = await this.prisma.outboundEmailJob.findUnique({
      where: { id: jobId },
    });

    if (!job) return;

    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password,
        },
        connectionTimeout: config.timeoutMs,
      });

      await transporter.sendMail({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: job.toEmail,
        subject: job.subject,
        html: job.htmlBody,
        text: job.textBody,
      });

      await this.prisma.outboundEmailJob.update({
        where: { id: jobId },
        data: {
          status: OutboundEmailJobStatus.SENT,
          sentAt: new Date(),
          lockedAt: null,
          provider: 'smtp',
          lastError: null,
        },
      });

      await this.updateHealth({
        lastSuccessAt: new Date().toISOString(),
      });

      logger.info(
        {
          event: WorkerEvents.JOB_COMPLETED,
          module: 'outbound-email',
          jobId,
          type: job.type,
        },
        'Correo enviado correctamente',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const nextAttemptCount = job.attemptCount + 1;
      const shouldDeadLetter = nextAttemptCount >= job.maxAttempts;
      const retryMinutes = Math.min(30, Math.max(1, 2 ** Math.min(6, nextAttemptCount)));

      await this.prisma.outboundEmailJob.update({
        where: { id: jobId },
        data: {
          status: shouldDeadLetter ? OutboundEmailJobStatus.DEAD : OutboundEmailJobStatus.FAILED,
          attemptCount: nextAttemptCount,
          lockedAt: null,
          lastError: message.slice(0, 1500),
          nextAttemptAt: shouldDeadLetter
            ? job.nextAttemptAt
            : new Date(now.getTime() + retryMinutes * 60 * 1000),
        },
      });

      await this.updateHealth({
        lastErrorAt: new Date().toISOString(),
        lastErrorMessage: message.slice(0, 500),
      });

      logger.error(
        {
          event: shouldDeadLetter ? WorkerEvents.JOB_DEAD : WorkerEvents.JOB_RETRY,
          module: 'outbound-email',
          jobId,
          attempts: nextAttemptCount,
          error: message,
        },
        shouldDeadLetter
          ? 'Correo movido a dead-letter por maximo de intentos'
          : 'Error al enviar correo, se programo reintento',
      );
    }
  }

  private async getEmailConfig(): Promise<EmailOutboundConfig | null> {
    const setting = await this.prisma.setting.findFirst({
      where: {
        key: EMAIL_OUTBOUND_SETTING_KEY,
        organizationId: null,
        isActive: true,
      },
      orderBy: { updatedAt: 'desc' },
      select: { value: true },
    });

    if (!setting?.value) {
      return null;
    }

    let parsed: Partial<EmailOutboundConfig> | null = null;
    try {
      parsed = JSON.parse(setting.value) as Partial<EmailOutboundConfig>;
    } catch {
      return null;
    }

    const config: EmailOutboundConfig = {
      provider: 'smtp',
      host: parsed.host ?? '',
      port: parsed.port ?? 587,
      secure: parsed.secure ?? false,
      user: parsed.user ?? '',
      password: parsed.password ?? '',
      fromName: parsed.fromName ?? 'AtlasERP',
      fromEmail: parsed.fromEmail ?? '',
      timeoutMs: parsed.timeoutMs ?? 10000,
      isActive: parsed.isActive ?? false,
    };

    if (!config.host || !config.user || !config.password || !config.fromEmail) {
      return null;
    }

    return config;
  }

  private async updateHealth(update: {
    lastSuccessAt?: string;
    lastErrorAt?: string;
    lastErrorMessage?: string;
  }): Promise<void> {
    const existing = await this.prisma.setting.findFirst({
      where: {
        key: EMAIL_OUTBOUND_HEALTH_SETTING_KEY,
        organizationId: null,
      },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, value: true },
    });

    const current = (() => {
      if (!existing?.value) return {} as Record<string, unknown>;
      try {
        return JSON.parse(existing.value) as Record<string, unknown>;
      } catch {
        return {} as Record<string, unknown>;
      }
    })();

    const next = {
      ...current,
      ...update,
    };

    if (existing) {
      await this.prisma.setting.update({
        where: { id: existing.id },
        data: { value: JSON.stringify(next), isActive: true },
      });
      return;
    }

    await this.prisma.setting.create({
      data: {
        organizationId: null,
        key: EMAIL_OUTBOUND_HEALTH_SETTING_KEY,
        value: JSON.stringify(next),
        description: 'Ultimo estado de salud del envio de correo saliente.',
        isActive: true,
      },
    });
  }
}
