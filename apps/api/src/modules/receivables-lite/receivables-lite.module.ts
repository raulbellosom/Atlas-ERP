import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { ReceivablesLiteController } from './receivables-lite.controller';
import { ReceivablesLiteService } from './receivables-lite.service';

@Module({
  imports: [AuditModule],
  controllers: [ReceivablesLiteController],
  providers: [ReceivablesLiteService],
  exports: [ReceivablesLiteService],
})
export class ReceivablesLiteModule {}
