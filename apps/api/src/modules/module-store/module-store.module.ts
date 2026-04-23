import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { ManifestValidatorService } from './manifest/manifest-validator.service';
import { ModuleStoreController } from './module-store.controller';
import { ModuleStoreService } from './module-store.service';

@Module({
  imports: [PrismaModule],
  controllers: [ModuleStoreController],
  providers: [ModuleStoreService, ManifestValidatorService],
  exports: [ManifestValidatorService],
})
export class ModuleStoreModule {}
