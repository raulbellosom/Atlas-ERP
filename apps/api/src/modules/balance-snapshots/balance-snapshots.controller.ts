import { Controller, Get, Param, Query } from '@nestjs/common';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { ListBalanceSnapshotsQueryDto } from './dto/list-balance-snapshots.query.dto';
import { BalanceSnapshotsService } from './balance-snapshots.service';
import { RequireModuleInstalled } from '../../common/decorators/module-install.decorator';

@RequireModuleInstalled('financial-operations')
@Controller('v1/balance-snapshots')
export class BalanceSnapshotsController {
  constructor(private readonly balanceSnapshotsService: BalanceSnapshotsService) {}

  @RequireAllPermissions('finops:balance_snapshot:read')
  @Get()
  findAll(@Query() query: ListBalanceSnapshotsQueryDto) {
    return this.balanceSnapshotsService.findAll(query);
  }

  @RequireAllPermissions('finops:balance_snapshot:read')
  @Get('bank-account/:bankAccountId/latest')
  findLatestByBankAccount(@Param('bankAccountId') bankAccountId: string) {
    return this.balanceSnapshotsService.findLatestByBankAccount(bankAccountId);
  }

  @RequireAllPermissions('finops:balance_snapshot:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.balanceSnapshotsService.findOneById(id);
  }
}
