import { Module } from '@nestjs/common';
import { SecurityModule } from '../../common/security/security.module';
import { BranchesModule } from '../branches/branches.module';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  imports: [BranchesModule, SecurityModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
