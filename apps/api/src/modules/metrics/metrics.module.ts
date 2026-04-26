import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { ConflictMetricsService } from './conflict-metrics.service';
import { JobMetricsService } from './jobs-metrics.service';
import { MetricsController } from './metrics.controller';
import { SyncMetricsService } from './sync-metrics.service';

@Module({
  imports: [PrismaModule],
  controllers: [MetricsController],
  providers: [JobMetricsService, SyncMetricsService, ConflictMetricsService],
  exports: [JobMetricsService, SyncMetricsService, ConflictMetricsService],
})
export class MetricsModule {}
