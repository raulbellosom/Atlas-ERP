import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RedisPubSubService } from '../../infrastructure/redis/redis.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

export const OUTBOUND_EMAIL_JOBS_CHANNEL = 'atlaserp.outbound-email.jobs';

export type EnqueueOutboundEmailJobInput = {
  organizationId?: string | null;
  type: string;
  toEmail: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  maxAttempts?: number;
};

const OUTBOUND_EMAIL_JOB_SELECT = {
  id: true,
  organizationId: true,
  type: true,
  toEmail: true,
  subject: true,
  status: true,
  attemptCount: true,
  maxAttempts: true,
  nextAttemptAt: true,
  createdAt: true,
} satisfies Prisma.OutboundEmailJobSelect;

export type OutboundEmailJobSummary = Prisma.OutboundEmailJobGetPayload<{
  select: typeof OUTBOUND_EMAIL_JOB_SELECT;
}>;

@Injectable()
export class OutboundEmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisPubSubService: RedisPubSubService,
  ) {}

  async enqueueJob(input: EnqueueOutboundEmailJobInput): Promise<OutboundEmailJobSummary> {
    const job = await this.prisma.outboundEmailJob.create({
      data: {
        organizationId: input.organizationId ?? null,
        type: input.type,
        toEmail: input.toEmail.toLowerCase().trim(),
        subject: input.subject,
        htmlBody: input.htmlBody,
        textBody: input.textBody,
        maxAttempts: input.maxAttempts ?? 3,
      },
      select: OUTBOUND_EMAIL_JOB_SELECT,
    });

    await this.redisPubSubService.publish(
      OUTBOUND_EMAIL_JOBS_CHANNEL,
      JSON.stringify({ jobId: job.id, type: job.type, enqueuedAt: new Date().toISOString() }),
    );

    return job;
  }
}
