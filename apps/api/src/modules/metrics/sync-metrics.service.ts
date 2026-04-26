import { Injectable } from '@nestjs/common';

export interface SyncPushMetrics {
  total: number;
  itemsProcessed: number;
  itemsErrored: number;
  itemsConflicted: number;
  itemsIdempotent: number;
  durations: number[];
}

export interface SyncPullMetrics {
  total: number;
  changesDelivered: number;
  durations: number[];
}

export interface ConflictMetrics {
  open: number;
  resolvedToday: number;
  byResolution: { LOCAL: number; SERVER: number; DISCARDED: number };
}

@Injectable()
export class SyncMetricsService {
  private push: SyncPushMetrics = {
    total: 0,
    itemsProcessed: 0,
    itemsErrored: 0,
    itemsConflicted: 0,
    itemsIdempotent: 0,
    durations: [],
  };

  private pull: SyncPullMetrics = {
    total: 0,
    changesDelivered: 0,
    durations: [],
  };

  private conflicts: ConflictMetrics = {
    open: 0,
    resolvedToday: 0,
    byResolution: { LOCAL: 0, SERVER: 0, DISCARDED: 0 },
  };

  private activeClients = new Map<string, number>();

  recordPushCompleted(stats: {
    durationMs: number;
    processed: number;
    errored: number;
    conflicted: number;
    idempotent: number;
    clientId: string;
  }): void {
    this.push.total++;
    this.push.itemsProcessed += stats.processed;
    this.push.itemsErrored += stats.errored;
    this.push.itemsConflicted += stats.conflicted;
    this.push.itemsIdempotent += stats.idempotent;
    this.push.durations = [...this.push.durations.slice(-99), stats.durationMs];
    this.activeClients.set(stats.clientId, Date.now());
  }

  recordPullCompleted(stats: {
    durationMs: number;
    changesDelivered: number;
    clientId: string;
  }): void {
    this.pull.total++;
    this.pull.changesDelivered += stats.changesDelivered;
    this.pull.durations = [...this.pull.durations.slice(-99), stats.durationMs];
    this.activeClients.set(stats.clientId, Date.now());
  }

  recordConflictResolved(resolution: 'LOCAL' | 'SERVER' | 'DISCARDED'): void {
    this.conflicts.open = Math.max(0, this.conflicts.open - 1);
    this.conflicts.resolvedToday++;
    this.conflicts.byResolution[resolution]++;
  }

  setOpenConflicts(count: number): void {
    this.conflicts.open = count;
  }

  getSnapshot() {
    const oneHourAgo = Date.now() - 3_600_000;
    const activeClientsLastHour = [...this.activeClients.values()].filter(
      (t) => t > oneHourAgo,
    ).length;

    const p95 = (durations: number[]) => {
      if (durations.length === 0) return 0;
      const sorted = [...durations].sort((a, b) => a - b);
      return sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)] ?? 0;
    };

    const avg = (durations: number[]) =>
      durations.length === 0
        ? 0
        : Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);

    return {
      push: {
        total: this.push.total,
        itemsProcessed: this.push.itemsProcessed,
        itemsErrored: this.push.itemsErrored,
        itemsConflicted: this.push.itemsConflicted,
        itemsIdempotent: this.push.itemsIdempotent,
        avgDuration: avg(this.push.durations),
        p95Duration: p95(this.push.durations),
      },
      pull: {
        total: this.pull.total,
        changesDelivered: this.pull.changesDelivered,
        avgDuration: avg(this.pull.durations),
        p95Duration: p95(this.pull.durations),
      },
      conflicts: {
        open: this.conflicts.open,
        resolvedToday: this.conflicts.resolvedToday,
        byResolution: this.conflicts.byResolution,
      },
      activeClientsLastHour,
    };
  }
}
