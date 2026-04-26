import pino from 'pino';

const LOG_LEVEL = process.env['LOG_LEVEL'] ?? 'info';

export const logger = pino({
  level: LOG_LEVEL,
});

export const WorkerEvents = {
  WORKER_STARTED: 'WORKER_STARTED',
  WORKER_STOPPING: 'WORKER_STOPPING',
  JOB_STARTED: 'JOB_STARTED',
  JOB_COMPLETED: 'JOB_COMPLETED',
  JOB_FAILED: 'JOB_FAILED',
  JOB_RETRY: 'JOB_RETRY',
  JOB_DEAD: 'JOB_DEAD',
  JOB_ENQUEUED: 'JOB_ENQUEUED',
  JOB_DEQUEUED: 'JOB_DEQUEUED',
} as const;
