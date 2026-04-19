import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { FiscalPeriodStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateChartOfAccountDto } from './dto/create-chart-of-account.dto';
import { CreateFiscalPeriodDto } from './dto/create-fiscal-period.dto';
import { CreatePostingRuleDto } from './dto/create-posting-rule.dto';
import { ListChartOfAccountsQueryDto } from './dto/list-chart-of-accounts.query.dto';
import { ListJournalEntriesQueryDto } from './dto/list-journal-entries.query.dto';
import { UpdateChartOfAccountDto } from './dto/update-chart-of-account.dto';

@Injectable()
export class AccountingService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── ChartOfAccount ────────────────────────────────────────────────────────

  async createChartOfAccount(dto: CreateChartOfAccountDto) {
    const existing = await this.prisma.chartOfAccount.findFirst({
      where: { organizationId: dto.organizationId, code: dto.code },
    });
    if (existing) throw new ConflictException(`Cuenta con código ${dto.code} ya existe.`);

    return this.prisma.chartOfAccount.create({
      data: {
        organizationId: dto.organizationId,
        code: dto.code,
        name: dto.name,
        accountType: dto.accountType,
        parentId: dto.parentId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async listChartOfAccounts(query: ListChartOfAccountsQueryDto) {
    return this.prisma.chartOfAccount.findMany({
      where: {
        organizationId: query.organizationId,
        ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      },
      orderBy: { code: 'asc' },
    });
  }

  async getChartOfAccount(id: string) {
    const account = await this.prisma.chartOfAccount.findUnique({ where: { id } });
    if (!account) throw new NotFoundException('Cuenta contable no encontrada.');
    return account;
  }

  async updateChartOfAccount(id: string, dto: UpdateChartOfAccountDto) {
    await this.getChartOfAccount(id);
    return this.prisma.chartOfAccount.update({ where: { id }, data: dto });
  }

  // ─── PostingRule ───────────────────────────────────────────────────────────

  async createPostingRule(dto: CreatePostingRuleDto) {
    const existing = await this.prisma.postingRule.findFirst({
      where: { organizationId: dto.organizationId, categoryCode: dto.categoryCode },
    });
    if (existing)
      throw new ConflictException(`Regla para categoría ${dto.categoryCode} ya existe.`);

    return this.prisma.postingRule.create({
      data: {
        organizationId: dto.organizationId,
        categoryCode: dto.categoryCode,
        movementType: dto.movementType,
        debitAccountId: dto.debitAccountId,
        creditAccountId: dto.creditAccountId,
        description: dto.description,
      },
      include: { debitAccount: true, creditAccount: true },
    });
  }

  async listPostingRules(organizationId: string) {
    return this.prisma.postingRule.findMany({
      where: { organizationId },
      include: { debitAccount: true, creditAccount: true },
      orderBy: { categoryCode: 'asc' },
    });
  }

  // ─── FiscalPeriod ──────────────────────────────────────────────────────────

  async createFiscalPeriod(dto: CreateFiscalPeriodDto) {
    const existing = await this.prisma.fiscalPeriod.findFirst({
      where: { organizationId: dto.organizationId, year: dto.year, month: dto.month },
    });
    if (existing)
      throw new ConflictException(
        `Período ${dto.year}-${String(dto.month).padStart(2, '0')} ya existe.`,
      );

    return this.prisma.fiscalPeriod.create({
      data: { organizationId: dto.organizationId, year: dto.year, month: dto.month },
    });
  }

  async listFiscalPeriods(organizationId: string) {
    return this.prisma.fiscalPeriod.findMany({
      where: { organizationId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async closeFiscalPeriod(id: string) {
    const period = await this.prisma.fiscalPeriod.findUnique({ where: { id } });
    if (!period) throw new NotFoundException('Período fiscal no encontrado.');
    if (period.status === FiscalPeriodStatus.CLOSED)
      throw new ConflictException('El período ya está cerrado.');

    return this.prisma.fiscalPeriod.update({
      where: { id },
      data: { status: FiscalPeriodStatus.CLOSED, closedAt: new Date() },
    });
  }

  // ─── JournalEntry ──────────────────────────────────────────────────────────

  async listJournalEntries(query: ListJournalEntriesQueryDto) {
    const where: Record<string, unknown> = { organizationId: query.organizationId };

    if (query.year !== undefined || query.month !== undefined) {
      const periodWhere: Record<string, unknown> = {};
      if (query.year !== undefined) periodWhere['year'] = query.year;
      if (query.month !== undefined) periodWhere['month'] = query.month;
      const periods = await this.prisma.fiscalPeriod.findMany({
        where: { organizationId: query.organizationId, ...periodWhere },
        select: { id: true },
      });
      where['fiscalPeriodId'] = { in: periods.map((p) => p.id) };
    }

    return this.prisma.journalEntry.findMany({
      where,
      include: {
        lines: { include: { debitAccount: true, creditAccount: true } },
        fiscalPeriod: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getJournalEntry(id: string) {
    const entry = await this.prisma.journalEntry.findUnique({
      where: { id },
      include: {
        lines: { include: { debitAccount: true, creditAccount: true } },
        fiscalPeriod: true,
      },
    });
    if (!entry) throw new NotFoundException('Asiento contable no encontrado.');
    return entry;
  }
}
