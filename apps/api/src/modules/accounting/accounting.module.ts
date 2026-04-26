import { Module } from '@nestjs/common';
import { AccountingController } from './accounting.controller';
import { AccountingReportsService } from './accounting-reports.service';
import { AccountingService } from './accounting.service';
import { PostingEngineService } from './posting-engine.service';

@Module({
  controllers: [AccountingController],
  providers: [AccountingService, AccountingReportsService, PostingEngineService],
  exports: [AccountingService],
})
export class AccountingModule {}
