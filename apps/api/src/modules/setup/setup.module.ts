import { Module } from '@nestjs/common';
import { SecurityModule } from '../../common/security/security.module';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';

@Module({
  imports: [SecurityModule],
  controllers: [SetupController],
  providers: [SetupService],
  exports: [SetupService],
})
export class SetupModule {}
