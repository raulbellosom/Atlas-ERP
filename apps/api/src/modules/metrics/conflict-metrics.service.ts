import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

export interface ConflictMetricsSnapshot {
  open: number;
  openByType: { SIMULTANEOUS_EDIT: number; DELETE_VS_EDIT: number; POSSIBLE_DUPLICATE: number };
  resolvedLast24h: number;
  resolvedLast7d: number;
  avgResolutionTimeMinutes: number;
  p95ResolutionTimeMinutes: number;
  resolutionDistribution: { SERVER: number; LOCAL: number; DISCARDED: number };
  topConflictedEntities: { entityType: string; count: number }[];
}

const CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class ConflictMetricsService {
  private readonly logger = new Logger(ConflictMetricsService.name);
  private cache: ConflictMetricsSnapshot | null = null;
  private cacheAt = 0;

  constructor(private readonly prisma: PrismaService) {}

  async getSnapshot(): Promise<ConflictMetricsSnapshot> {
    if (this.cache && Date.now() - this.cacheAt < CACHE_TTL_MS) {
      return this.cache;
    }

    const now = new Date();
    const ago24h = new Date(now.getTime() - 86_400_000);
    const ago7d = new Date(now.getTime() - 7 * 86_400_000);

    const [openConflicts, resolved24h, resolved7d, allResolved] = await Promise.all([
      this.prisma.conflictRecord.findMany({ where: { status: 'OPEN' } }),
      this.prisma.conflictRecord.count({
        where: { status: { not: 'OPEN' }, resolvedAt: { gte: ago24h } },
      }),
      this.prisma.conflictRecord.count({
        where: { status: { not: 'OPEN' }, resolvedAt: { gte: ago7d } },
      }),
      this.prisma.conflictRecord.findMany({
        where: { status: { not: 'OPEN' }, resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true, resolution: true, entityType: true },
      }),
    ]);

    const openByType = { SIMULTANEOUS_EDIT: 0, DELETE_VS_EDIT: 0, POSSIBLE_DUPLICATE: 0 };

    const resolutionDist = { SERVER: 0, LOCAL: 0, DISCARDED: 0 };
    const entityCount: Record<string, number> = {};
    const resolutionMinutes: number[] = [];

    for (const c of openConflicts) {
      if (c.entityType) {
        entityCount[c.entityType] = (entityCount[c.entityType] ?? 0) + 1;
      }
    }

    for (const c of allResolved) {
      if (c.resolution === 'KEEP_SERVER') resolutionDist.SERVER++;
      else if (c.resolution === 'APPROVE_LOCAL') resolutionDist.LOCAL++;
      else resolutionDist.DISCARDED++;

      if (c.resolvedAt) {
        const minutes = (c.resolvedAt.getTime() - c.createdAt.getTime()) / 60_000;
        resolutionMinutes.push(minutes);
        if (c.entityType) {
          entityCount[c.entityType] = (entityCount[c.entityType] ?? 0) + 1;
        }
      }
    }

    resolutionMinutes.sort((a, b) => a - b);
    const avg =
      resolutionMinutes.length > 0
        ? Math.round(resolutionMinutes.reduce((a, b) => a + b, 0) / resolutionMinutes.length)
        : 0;
    const p95Idx = Math.max(0, Math.ceil(resolutionMinutes.length * 0.95) - 1);
    const p95 = resolutionMinutes.length > 0 ? Math.round(resolutionMinutes[p95Idx] ?? 0) : 0;

    const topConflictedEntities = Object.entries(entityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([entityType, count]) => ({ entityType, count }));

    this.cache = {
      open: openConflicts.length,
      openByType,
      resolvedLast24h: resolved24h,
      resolvedLast7d: resolved7d,
      avgResolutionTimeMinutes: avg,
      p95ResolutionTimeMinutes: p95,
      resolutionDistribution: resolutionDist,
      topConflictedEntities,
    };
    this.cacheAt = Date.now();

    return this.cache;
  }

  logDailySummary(): void {
    if (!this.cache) return;
    this.logger.log(
      JSON.stringify({
        event: 'DAILY_CONFLICT_SUMMARY',
        open: this.cache.open,
        resolvedToday: this.cache.resolvedLast24h,
        avgResolutionTimeMinutes: this.cache.avgResolutionTimeMinutes,
      }),
    );
  }
}
