import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ConflictMetricsService } from './conflict-metrics.service';
import { JobMetricsService } from './jobs-metrics.service';
import { SyncMetricsService } from './sync-metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly jobMetrics: JobMetricsService,
    private readonly syncMetrics: SyncMetricsService,
    private readonly conflictMetrics: ConflictMetricsService,
  ) {}

  @Public()
  @Get('jobs')
  getJobMetrics() {
    return this.jobMetrics.getSnapshot();
  }

  @Public()
  @Get('sync')
  getSyncMetrics() {
    return this.syncMetrics.getSnapshot();
  }

  @Public()
  @Get('conflicts')
  async getConflictMetrics() {
    return this.conflictMetrics.getSnapshot();
  }
}
