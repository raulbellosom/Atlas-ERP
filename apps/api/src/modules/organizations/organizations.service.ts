import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  buildCaseInsensitiveSearchFilter,
  buildIsActiveFilter,
  buildSoftDeleteFilter,
} from '../../common/query-filters';
import { PasswordService } from '../../common/security/password.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ListOrganizationsQueryDto } from './dto/list-organizations.query.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

const ORGANIZATION_SELECT = {
  id: true,
  name: true,
  slug: true,
  legalName: true,
  legalEntityType: true,
  rfc: true,
  fiscalRegime: true,
  primaryColor: true,
  logoAttachmentId: true,
  phone: true,
  email: true,
  website: true,
  street: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  industry: true,
  companySize: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.OrganizationSelect;

type OrganizationSummary = Prisma.OrganizationGetPayload<{
  select: typeof ORGANIZATION_SELECT;
}>;

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async findAll(query: ListOrganizationsQueryDto): Promise<OrganizationSummary[]> {
    const where: Prisma.OrganizationWhereInput = {
      ...buildSoftDeleteFilter(false),
      ...buildIsActiveFilter(query.includeInactive),
      ...buildCaseInsensitiveSearchFilter(['name', 'slug'], query.search),
    };

    return this.prisma.organization.findMany({
      where,
      select: ORGANIZATION_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
  }

  async findOneById(id: string): Promise<OrganizationSummary | null> {
    return this.prisma.organization.findFirst({
      where: { id, deletedAt: null },
      select: ORGANIZATION_SELECT,
    });
  }

  async findOneBySlug(slug: string): Promise<OrganizationSummary | null> {
    return this.prisma.organization.findFirst({
      where: { slug, deletedAt: null },
      select: ORGANIZATION_SELECT,
    });
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<OrganizationSummary> {
    return this.prisma.organization.update({
      where: { id },
      data: dto,
      select: ORGANIZATION_SELECT,
    });
  }

  async purge(organizationId: string, requestingUserId: string, password: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id: requestingUserId, organizationId, deletedAt: null },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const valid = await this.passwordService.verify(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Contraseña incorrecta.');
    }

    const org = await this.prisma.organization.findFirst({ where: { id: organizationId } });
    if (!org) {
      throw new NotFoundException('Organización no encontrada.');
    }

    await this.prisma.$transaction(
      async (tx) => {
        // ── Sync ──
        await tx.conflictResolution.deleteMany({ where: { organizationId } });
        await tx.syncLog.deleteMany({ where: { organizationId } });
        await tx.conflictRecord.deleteMany({ where: { organizationId } });
        await tx.syncItem.deleteMany({ where: { organizationId } });
        await tx.syncSession.deleteMany({ where: { organizationId } });
        await tx.deviceRegistry.deleteMany({ where: { organizationId } });

        // ── Reconciliation (cascade deletes items) ──
        await tx.reconciliationSession.deleteMany({ where: { organizationId } });

        // ── Accounting ──
        await tx.accountingPostingError.deleteMany({ where: { organizationId } });
        await tx.journalEntry.deleteMany({ where: { organizationId } }); // cascades journal_entry_lines
        await tx.postingRule.deleteMany({ where: { organizationId } });
        await tx.chartOfAccount.updateMany({ where: { organizationId }, data: { parentId: null } });
        await tx.chartOfAccount.deleteMany({ where: { organizationId } });
        await tx.fiscalPeriod.deleteMany({ where: { organizationId } });

        // ── Financial ──
        await tx.transfer.deleteMany({ where: { organizationId } });
        await tx.balanceSnapshot.deleteMany({ where: { organizationId } });
        // financial_movement_attachments cascade when financial_movements deleted
        await tx.financialMovement.deleteMany({ where: { organizationId } });
        await tx.bankAccount.deleteMany({ where: { organizationId } });
        await tx.bankAccountType.deleteMany({ where: { organizationId } });

        // ── AR / AP ──
        await tx.receivableLite.deleteMany({ where: { organizationId } });
        await tx.payableLite.deleteMany({ where: { organizationId } });
        await tx.counterpartyLite.deleteMany({ where: { organizationId } });

        // ── HR ──
        await tx.leaveRequest.deleteMany({ where: { organizationId } });
        await tx.leaveBalance.deleteMany({ where: { organizationId } });
        await tx.contract.deleteMany({ where: { organizationId } });
        await tx.employee.deleteMany({ where: { organizationId } });
        await tx.position.deleteMany({ where: { organizationId } });
        await tx.department.deleteMany({ where: { organizationId } });

        // ── Module store ──
        await tx.moduleLifecycleAuditEvent.deleteMany({ where: { organizationId } });
        await tx.moduleInstallJob.deleteMany({ where: { organizationId } });
        await tx.tenantModuleInstallation.deleteMany({ where: { organizationId } });

        // ── Comms / audit ──
        await tx.notification.deleteMany({ where: { organizationId } });
        await tx.auditLog.deleteMany({ where: { organizationId } });
        await tx.attachment.deleteMany({ where: { organizationId } });
        await tx.setting.deleteMany({ where: { organizationId } });

        // ── Auth tokens & sessions ──
        await tx.refreshToken.updateMany({
          where: { organizationId },
          data: { parentTokenId: null },
        });
        await tx.refreshToken.deleteMany({ where: { organizationId } });
        await tx.session.deleteMany({ where: { organizationId } });
        await tx.passwordResetToken.deleteMany({ where: { organizationId } });

        // ── Users & roles (join tables first) ──
        await tx.userRole.deleteMany({ where: { user: { organizationId } } });
        await tx.rolePermission.deleteMany({ where: { role: { organizationId } } });
        await tx.user.deleteMany({ where: { organizationId } });
        await tx.role.updateMany({ where: { organizationId }, data: { parentRoleId: null } });
        await tx.role.deleteMany({ where: { organizationId } });

        // ── Branches ──
        await tx.branch.deleteMany({ where: { organizationId } });

        // ── Organization ──
        await tx.organization.delete({ where: { id: organizationId } });
      },
      { timeout: 60_000 },
    );

    // Reset setup state so the instance can be configured fresh
    await this.prisma.setupState.updateMany({
      data: { isCompleted: false, completedAt: null },
    });
  }
}
