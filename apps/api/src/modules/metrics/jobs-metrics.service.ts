import { Injectable, Logger } from '@nestjs/common';

export interface JobMetrics {
  total: number;
  success: number;
  failed: number;
  durations: number[];
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
}

export interface JobMetricsSummary {
  total: number;
  success: number;
  failed: number;
  avgDuration: number;
  p95Duration: number;
  maxDuration: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
}

@Injectable()
export class JobMetricsService {
  private readonly logger = new Logger(JobMetricsService.name);
  private readonly store = new Map<string, JobMetrics>();
  private queueSize = 0;
  private deadJobs = 0;
  private readonly recentJobs: number[] = [];

  recordJobStart(jobName: string, _jobId: string): void {
    if (!this.store.has(jobName)) {
      this.store.set(jobName, {
        total: 0,
        success: 0,
        failed: 0,
        durations: [],
        lastSuccessAt: null,
        lastFailureAt: null,
      });
    }
  }

  recordJobComplete(jobName: string, _jobId: string, durationMs: number): void {
    const m = this.store.get(jobName);
    if (!m) return;
    m.total++;
    m.success++;
    m.durations = [...m.durations.slice(-99), durationMs];
    m.lastSuccessAt = new Date().toISOString();
    this.recentJobs.push(Date.now());
  }

  recordJobFailed(jobName: string, _jobId: string, durationMs: number): void {
    const m = this.store.get(jobName);
    if (!m) return;
    m.total++;
    m.failed++;
    m.durations = [...m.durations.slice(-99), durationMs];
    m.lastFailureAt = new Date().toISOString();
  }

  recordJobDead(jobName: string, _jobId: string): void {
    this.deadJobs++;
    this.logger.error(JSON.stringify({ event: 'JOB_DEAD', jobName }));
  }

  setQueueSize(size: number): void {
    this.queueSize = size;
  }

  getSnapshot(): {
    queueSize: number;
    deadJobs: number;
    jobsPerMinute: number;
    jobs: Record<string, JobMetricsSummary>;
  } {
    const oneMinuteAgo = Date.now() - 60_000;
    const jobsPerMinute = this.recentJobs.filter((t) => t > oneMinuteAgo).length;

    const jobs: Record<string, JobMetricsSummary> = {};
    for (const [name, m] of this.store.entries()) {
      const sorted = [...m.durations].sort((a, b) => a - b);
      const p95Idx = Math.ceil(sorted.length * 0.95) - 1;
      jobs[name] = {
        total: m.total,
        success: m.success,
        failed: m.failed,
        avgDuration:
          sorted.length > 0
            ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length)
            : 0,
        p95Duration: sorted.length > 0 ? (sorted[Math.max(0, p95Idx)] ?? 0) : 0,
        maxDuration: sorted.length > 0 ? (sorted[sorted.length - 1] ?? 0) : 0,
        lastSuccessAt: m.lastSuccessAt,
        lastFailureAt: m.lastFailureAt,
      };
    }

    return { queueSize: this.queueSize, deadJobs: this.deadJobs, jobsPerMinute, jobs };
  }
}
