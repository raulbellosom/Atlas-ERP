import { Module } from '@nestjs/common';
import { AttachmentsModule } from '../attachments/attachments.module';
import { AuditModule } from '../audit/audit.module';
import { FinancialMovementsController } from './financial-movements.controller';
import { FinancialMovementsService } from './financial-movements.service';

@Module({
  imports: [AttachmentsModule, AuditModule],
  controllers: [FinancialMovementsController],
  providers: [FinancialMovementsService],
  exports: [FinancialMovementsService],
})
export class FinancialMovementsModule {}
