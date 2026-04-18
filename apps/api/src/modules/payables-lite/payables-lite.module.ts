import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PayablesLiteController } from './payables-lite.controller';
import { PayablesLiteService } from './payables-lite.service';

@Module({
  imports: [AuditModule],
  controllers: [PayablesLiteController],
  providers: [PayablesLiteService],
  exports: [PayablesLiteService],
})
export class PayablesLiteModule {}
