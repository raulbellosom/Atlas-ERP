import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { BalanceSummaryQueryDto } from './dto/balance-summary.query.dto';
import { ListBankAccountsQueryDto } from './dto/list-bank-accounts.query.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankAccountsService } from './bank-accounts.service';

@Controller('v1/bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @RequireAllPermissions('finops:bank_account:write')
  @Post()
  create(@Body() dto: CreateBankAccountDto) {
    return this.bankAccountsService.create(dto);
  }

  @RequireAllPermissions('finops:bank_account:read')
  @Get()
  findAll(@Query() query: ListBankAccountsQueryDto) {
    return this.bankAccountsService.findAll(query);
  }

  @RequireAllPermissions('finops:bank_account:read')
  @Get('organization/:organizationId/active-count')
  countActiveByOrganization(@Param('organizationId') organizationId: string) {
    return this.bankAccountsService.countActiveByOrganization(organizationId);
  }

  @RequireAllPermissions('finops:bank_account:read')
  @Get('organization/:organizationId/balance-summary')
  getBalanceSummaryByOrganization(
    @Param('organizationId') organizationId: string,
    @Query() query: BalanceSummaryQueryDto,
  ) {
    return this.bankAccountsService.getBalanceSummaryByOrganization(
      organizationId,
      query.includeInactive,
    );
  }

  @RequireAllPermissions('finops:bank_account:read')
  @Get(':id/balance')
  async getBalanceByAccount(@Param('id') id: string) {
    const balance = await this.bankAccountsService.getBalanceByAccount(id);
    if (!balance) {
      throw new NotFoundException('Cuenta bancaria no encontrada.');
    }
    return balance;
  }

  @RequireAllPermissions('finops:bank_account:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankAccountsService.findOneById(id);
  }

  @RequireAllPermissions('finops:bank_account:write')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBankAccountDto) {
    const updated = await this.bankAccountsService.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Cuenta bancaria no encontrada.');
    }
    return updated;
  }

  @RequireAllPermissions('finops:bank_account:write')
  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    const deleted = await this.bankAccountsService.softDelete(id);
    if (!deleted) {
      throw new NotFoundException('Cuenta bancaria no encontrada.');
    }
    return { deleted: true };
  }
}
