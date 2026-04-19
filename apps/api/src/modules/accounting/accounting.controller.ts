import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { AccountingService } from './accounting.service';
import { CreateChartOfAccountDto } from './dto/create-chart-of-account.dto';
import { CreateFiscalPeriodDto } from './dto/create-fiscal-period.dto';
import { CreatePostingRuleDto } from './dto/create-posting-rule.dto';
import { ListChartOfAccountsQueryDto } from './dto/list-chart-of-accounts.query.dto';
import { ListJournalEntriesQueryDto } from './dto/list-journal-entries.query.dto';
import { UpdateChartOfAccountDto } from './dto/update-chart-of-account.dto';

@Controller('v1/accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // ─── ChartOfAccount ────────────────────────────────────────────────────────

  @RequireAllPermissions('accounting:admin')
  @Post('chart-of-accounts')
  createChartOfAccount(@Body() dto: CreateChartOfAccountDto) {
    return this.accountingService.createChartOfAccount(dto);
  }

  @RequireAllPermissions('accounting:read')
  @Get('chart-of-accounts')
  listChartOfAccounts(@Query() query: ListChartOfAccountsQueryDto) {
    return this.accountingService.listChartOfAccounts(query);
  }

  @RequireAllPermissions('accounting:read')
  @Get('chart-of-accounts/:id')
  getChartOfAccount(@Param('id') id: string) {
    return this.accountingService.getChartOfAccount(id);
  }

  @RequireAllPermissions('accounting:admin')
  @Patch('chart-of-accounts/:id')
  updateChartOfAccount(@Param('id') id: string, @Body() dto: UpdateChartOfAccountDto) {
    return this.accountingService.updateChartOfAccount(id, dto);
  }

  // ─── PostingRule ───────────────────────────────────────────────────────────

  @RequireAllPermissions('accounting:admin')
  @Post('posting-rules')
  createPostingRule(@Body() dto: CreatePostingRuleDto) {
    return this.accountingService.createPostingRule(dto);
  }

  @RequireAllPermissions('accounting:read')
  @Get('posting-rules')
  listPostingRules(@Query('organizationId') organizationId: string) {
    return this.accountingService.listPostingRules(organizationId);
  }

  // ─── FiscalPeriod ──────────────────────────────────────────────────────────

  @RequireAllPermissions('accounting:write')
  @Post('fiscal-periods')
  createFiscalPeriod(@Body() dto: CreateFiscalPeriodDto) {
    return this.accountingService.createFiscalPeriod(dto);
  }

  @RequireAllPermissions('accounting:read')
  @Get('fiscal-periods')
  listFiscalPeriods(@Query('organizationId') organizationId: string) {
    return this.accountingService.listFiscalPeriods(organizationId);
  }

  @RequireAllPermissions('accounting:write')
  @Patch('fiscal-periods/:id/close')
  closeFiscalPeriod(@Param('id') id: string) {
    return this.accountingService.closeFiscalPeriod(id);
  }

  // ─── JournalEntry ──────────────────────────────────────────────────────────

  @RequireAllPermissions('accounting:read')
  @Get('journal-entries')
  listJournalEntries(@Query() query: ListJournalEntriesQueryDto) {
    return this.accountingService.listJournalEntries(query);
  }

  @RequireAllPermissions('accounting:read')
  @Get('journal-entries/:id')
  getJournalEntry(@Param('id') id: string) {
    return this.accountingService.getJournalEntry(id);
  }
}
