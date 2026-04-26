import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { FinancialMovementsModule } from '../financial-movements/financial-movements.module';
import { ReceivablesLiteController } from './receivables-lite.controller';
import { ReceivablesLiteService } from './receivables-lite.service';

@Module({
  imports: [AuditModule, FinancialMovementsModule],
  controllers: [ReceivablesLiteController],
  providers: [ReceivablesLiteService],
  exports: [ReceivablesLiteService],
})
export class ReceivablesLiteModule {}
