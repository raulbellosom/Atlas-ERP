import { Module } from '@nestjs/common';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { PostingEngineService } from './posting-engine.service';

@Module({
  controllers: [AccountingController],
  providers: [AccountingService, PostingEngineService],
  exports: [AccountingService],
})
export class AccountingModule {}
