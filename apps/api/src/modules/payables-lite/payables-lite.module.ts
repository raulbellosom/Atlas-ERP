import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { FinancialMovementsModule } from '../financial-movements/financial-movements.module';
import { PayablesLiteController } from './payables-lite.controller';
import { PayablesLiteService } from './payables-lite.service';

@Module({
  imports: [AuditModule, FinancialMovementsModule],
  controllers: [PayablesLiteController],
  providers: [PayablesLiteService],
  exports: [PayablesLiteService],
})
export class PayablesLiteModule {}
