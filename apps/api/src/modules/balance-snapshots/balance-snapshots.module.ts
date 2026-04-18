import { Module } from '@nestjs/common';
import { BalanceSnapshotsController } from './balance-snapshots.controller';
import { BalanceSnapshotsService } from './balance-snapshots.service';

@Module({
  controllers: [BalanceSnapshotsController],
  providers: [BalanceSnapshotsService],
  exports: [BalanceSnapshotsService],
})
export class BalanceSnapshotsModule {}
