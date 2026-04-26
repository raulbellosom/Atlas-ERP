import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CounterpartiesLiteController } from './counterparties-lite.controller';
import { CounterpartiesLiteService } from './counterparties-lite.service';

@Module({
  imports: [AuditModule],
  controllers: [CounterpartiesLiteController],
  providers: [CounterpartiesLiteService],
  exports: [CounterpartiesLiteService],
})
export class CounterpartiesLiteModule {}
