import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { ErrorCode } from '../../common/errors';
import { PasswordService } from '../../common/security/password.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { sanitizeFilename } from '../attachments/utils/file-security.util';
import { InitializeSetupDto } from './dto/initialize-setup.dto';

const SETUP_STATE_KEY = 'initial_setup';
const SETUP_LOGO_EXPIRY_MINUTES = 30;
const SETUP_LOGO_ENTITY_TYPE = 'organization_logo';
const ALLOWED_SETUP_LOGO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const ALLOWED_SETUP_LOGO_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;

const FOUNDATION_ROLES: Array<{ name: string; description: string; level: number }> = [
  {
    name: 'owner',
    description: 'Propietario del tenant con control total y gobierno de la instancia.',
    level: 120,
  },
  {
    name: 'admin',
    description: 'Acceso administrativo completo para configuracion y operacion.',
    level: 100,
  },
];

export interface SetupStatus {
  setupRequired: boolean;
  isLocked: boolean;
  hasExistingData: boolean;
  activeOrganizations: number;
  activeUsers: number;
  branding: {
    organizationName: string | null;
    primaryColor: string | null;
    logoUrl: string | null;
    logoDataUrlLegacy: string | null;
  } | null;
}

@Injectable()
export class SetupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly storageService: StorageService,
  ) {}

  async getStatus(): Promise<SetupStatus> {
    await this.cleanupExpiredSetupUploads();

    const [setupState, activeOrganizations, activeUsers] = await Promise.all([
      this.prisma.setupState.findUnique({ where: { key: SETUP_STATE_KEY } }),
      this.prisma.organization.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.user.count({ where: { deletedAt: null, isActive: true } }),
    ]);

    const hasExistingData = activeOrganizations > 0 || activeUsers > 0;
    const isLocked = Boolean(setupState?.isCompleted) || hasExistingData;
    let branding: SetupStatus['branding'] = null;

    if (isLocked) {
      const organization = await this.prisma.organization.findFirst({
        where: { deletedAt: null, isActive: true },
        select: {
          commercialName: true,
          name: true,
          primaryColor: true,
          logoAttachment: {
            select: {
              storagePath: true,
            },
          },
          settings: {
            where: {
              key: {
                in: ['organization.ui.brand_name', 'organization.ui.logo_data_url'],
              },
            },
            select: {
              key: true,
              value: true,
            },
          },
        },
      });

      const settingsMap = new Map(
        (organization?.settings ?? []).map((setting) => [setting.key, setting.value]),
      );
      const organizationName =
        settingsMap.get('organization.ui.brand_name') ??
        organization?.commercialName ??
        organization?.name ??
        null;

      let logoUrl: string | null = null;
      if (organization?.logoAttachment?.storagePath) {
        try {
          logoUrl = await this.storageService.generatePresignedGetUrl(
            organization.logoAttachment.storagePath,
            300,
          );
        } catch {
          logoUrl = null;
        }
      }

      const legacyLogoDataUrl = logoUrl
        ? null
        : (settingsMap.get('organization.ui.logo_data_url') ?? null);

      branding = {
        organizationName,
        primaryColor: organization?.primaryColor ?? null,
        logoUrl,
        logoDataUrlLegacy: legacyLogoDataUrl,
      };
    }

    return {
      setupRequired: !isLocked,
      isLocked,
      hasExistingData,
      activeOrganizations,
      activeUsers,
      branding,
    };
  }

  async uploadLogo(
    file: Express.Multer.File | undefined,
  ): Promise<{ logoUploadToken: string; expiresAt: string }> {
    const status = await this.getStatus();
    if (!status.setupRequired) {
      throw new ConflictException({
        statusCode: 409,
        code: ErrorCode.SETUP_ALREADY_COMPLETED,
        message:
          'El setup inicial ya fue completado. El upload pÃºblico de logo no estÃ¡ disponible.',
        error: 'Conflict',
      });
    }

    this.validateSetupLogoFile(file);

    const extension = extname(file.originalname).toLowerCase();
    const safeFilename = sanitizeFilename(file.originalname.replace(extension, ''));
    const objectKey = [
      'uploads',
      'setup',
      'pending',
      `${randomUUID()}-${safeFilename}${extension}`,
    ].join('/');

    await this.storageService.uploadObject({
      objectName: objectKey,
      data: file.buffer,
      mimeType: file.mimetype,
    });

    const expiresAt = new Date(Date.now() + SETUP_LOGO_EXPIRY_MINUTES * 60_000);

    const upload = await this.prisma.setupUpload.create({
      data: {
        storagePath: objectKey,
        filename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        expiresAt,
      },
      select: {
        id: true,
        expiresAt: true,
      },
    });

    return {
      logoUploadToken: upload.id,
      expiresAt: upload.expiresAt.toISOString(),
    };
  }

  async initialize(
    dto: InitializeSetupDto,
  ): Promise<{ organizationId: string; ownerUserId: string }> {
    const status = await this.getStatus();
    if (!status.setupRequired) {
      throw new ConflictException({
        statusCode: 409,
        code: ErrorCode.SETUP_ALREADY_COMPLETED,
        message: 'La instalacion inicial ya fue completada o existen datos activos.',
        error: 'Conflict',
      });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const logoUploadToken = dto.logoUploadToken?.trim();
      let setupUpload: {
        id: string;
        storagePath: string;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        expiresAt: Date;
        consumedAt: Date | null;
      } | null = null;

      if (logoUploadToken) {
        setupUpload = await tx.setupUpload.findUnique({
          where: { id: logoUploadToken },
          select: {
            id: true,
            storagePath: true,
            filename: true,
            mimeType: true,
            sizeBytes: true,
            expiresAt: true,
            consumedAt: true,
          },
        });

        if (!setupUpload || setupUpload.consumedAt) {
          throw new BadRequestException({
            statusCode: 400,
            code: ErrorCode.BAD_REQUEST,
            message: 'El token de logo de setup no existe o ya fue consumido.',
            error: 'Bad Request',
          });
        }

        if (setupUpload.expiresAt < now) {
          throw new ConflictException({
            statusCode: 409,
            code: ErrorCode.CONFLICT,
            message: 'El token de logo de setup expirÃ³. Sube nuevamente el archivo.',
            error: 'Conflict',
          });
        }

        const objectExists = await this.storageService.objectExists(setupUpload.storagePath);
        if (!objectExists) {
          throw new BadRequestException({
            statusCode: 400,
            code: ErrorCode.FILE_NOT_FOUND,
            message: 'El archivo temporal del logo no existe en almacenamiento.',
            error: 'Bad Request',
          });
        }
      }

      const slugBase = this.toSlug(dto.businessCommercialName || dto.businessLegalName);
      const slug = await this.generateUniqueSlug(tx, slugBase);

      const organization = await tx.organization.create({
        data: {
          name: dto.businessCommercialName,
          slug,
          legalName: dto.businessLegalName,
          commercialName: dto.businessCommercialName,
          primaryColor: dto.primaryColor ?? null,
          address: dto.address ?? null,
          isActive: true,
        } satisfies Prisma.OrganizationUncheckedCreateInput,
        select: { id: true },
      });

      await this.ensureFoundationRolesAndMappings(tx, organization.id);

      const ownerRole = await tx.role.findUnique({
        where: {
          organizationId_name: {
            organizationId: organization.id,
            name: 'owner',
          },
        },
        select: { id: true },
      });

      if (!ownerRole) {
        throw new InternalServerErrorException(
          'No se pudo resolver el rol owner para setup inicial.',
        );
      }

      const passwordHash = await this.passwordService.hash(dto.ownerPassword);

      const ownerUser = await tx.user.create({
        data: {
          organizationId: organization.id,
          email: dto.ownerEmail.toLowerCase().trim(),
          displayName: dto.ownerDisplayName,
          passwordHash,
          isActive: true,
          isLocked: false,
        },
        select: { id: true },
      });

      await tx.userRole.upsert({
        where: {
          userId_roleId: {
            userId: ownerUser.id,
            roleId: ownerRole.id,
          },
        },
        update: {},
        create: {
          userId: ownerUser.id,
          roleId: ownerRole.id,
        },
      });

      let logoAttachmentId = dto.logoAttachmentId?.trim() || null;

      if (setupUpload) {
        const logoAttachment = await tx.attachment.create({
          data: {
            organizationId: organization.id,
            filename: setupUpload.filename,
            storagePath: setupUpload.storagePath,
            mimeType: setupUpload.mimeType,
            sizeBytes: setupUpload.sizeBytes,
            entityType: SETUP_LOGO_ENTITY_TYPE,
            entityId: organization.id,
            uploadedById: ownerUser.id,
          },
          select: { id: true },
        });

        logoAttachmentId = logoAttachment.id;

        await tx.setupUpload.update({
          where: { id: setupUpload.id },
          data: { consumedAt: now },
        });
      }

      if (logoAttachmentId) {
        await tx.organization.update({
          where: { id: organization.id },
          data: { logoAttachmentId },
        });
      }

      await this.upsertOrganizationSettings(tx, organization.id, {
        brandName: dto.businessCommercialName,
        primaryColor: dto.primaryColor ?? null,
        industry: dto.industry ?? null,
        companySize: dto.companySize ?? null,
        logoDataUrl: dto.logoDataUrl ?? null,
      });

      await this.autoInstallCoreModules(tx, organization.id);

      await tx.setupState.upsert({
        where: { key: SETUP_STATE_KEY },
        update: {
          isCompleted: true,
          completedAt: new Date(),
          metadata: {
            organizationId: organization.id,
            ownerUserId: ownerUser.id,
          },
        },
        create: {
          key: SETUP_STATE_KEY,
          isCompleted: true,
          completedAt: new Date(),
          metadata: {
            organizationId: organization.id,
            ownerUserId: ownerUser.id,
          },
        },
      });

      return {
        organizationId: organization.id,
        ownerUserId: ownerUser.id,
      };
    });

    return result;
  }

  private async generateUniqueSlug(tx: Prisma.TransactionClient, base: string): Promise<string> {
    const normalizedBase = base || 'empresa';
    for (let i = 0; i < 50; i += 1) {
      const suffix = i === 0 ? '' : `-${i + 1}`;
      const candidate = `${normalizedBase}${suffix}`;
      const exists = await tx.organization.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!exists) {
        return candidate;
      }
    }

    return `${normalizedBase}-${Date.now()}`;
  }

  private toSlug(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }

  private async ensureFoundationRolesAndMappings(
    tx: Prisma.TransactionClient,
    organizationId: string,
  ): Promise<void> {
    for (const role of FOUNDATION_ROLES) {
      await tx.role.upsert({
        where: {
          organizationId_name: {
            organizationId,
            name: role.name,
          },
        },
        update: {
          description: role.description,
          level: role.level,
          isActive: true,
          deletedAt: null,
        },
        create: {
          organizationId,
          name: role.name,
          description: role.description,
          level: role.level,
          isActive: true,
        },
      });
    }

    const [roles, permissions] = await Promise.all([
      tx.role.findMany({
        where: { organizationId, name: { in: FOUNDATION_ROLES.map((role) => role.name) } },
        select: { id: true, name: true },
      }),
      tx.permission.findMany({
        where: { isActive: true },
        select: { id: true, key: true },
      }),
    ]);

    if (permissions.length === 0) {
      throw new InternalServerErrorException(
        'Catalogo de permisos vacio. Ejecuta db:seed antes de inicializar setup.',
      );
    }

    const roleByName = new Map(roles.map((role) => [role.name, role.id]));
    const permissionByKey = new Map(
      permissions.map((permission) => [permission.key, permission.id]),
    );

    const allPermissionKeys = permissions.map((permission) => permission.key);
    const permissionMapping: Record<string, string[]> = {
      owner: allPermissionKeys,
      admin: allPermissionKeys,
    };

    for (const [roleName, permissionKeys] of Object.entries(permissionMapping)) {
      const roleId = roleByName.get(roleName);
      if (!roleId) {
        continue;
      }

      for (const permissionKey of permissionKeys) {
        const permissionId = permissionByKey.get(permissionKey);
        if (!permissionId) {
          continue;
        }

        await tx.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId,
              permissionId,
            },
          },
          update: {},
          create: {
            roleId,
            permissionId,
          },
        });
      }
    }
  }

  private async upsertOrganizationSettings(
    tx: Prisma.TransactionClient,
    organizationId: string,
    branding: {
      brandName: string;
      primaryColor: string | null;
      industry: string | null;
      companySize: string | null;
      logoDataUrl: string | null;
    },
  ): Promise<void> {
    const settings = [
      {
        key: 'organization.ui.brand_name',
        value: branding.brandName,
        description: 'Nombre comercial mostrado en la UI para la organizacion activa.',
      },
      {
        key: 'organization.ui.primary_color',
        value: branding.primaryColor ?? '',
        description: 'Color principal para el branding base de la organizacion.',
      },
      {
        key: 'organization.profile.industry',
        value: branding.industry ?? '',
        description: 'Sector industrial capturado durante el setup inicial.',
      },
      {
        key: 'organization.profile.company_size',
        value: branding.companySize ?? '',
        description: 'Tamano de empresa capturado durante el setup inicial.',
      },
      {
        key: 'organization.ui.logo_data_url',
        value: branding.logoDataUrl ?? '',
        description:
          'Compat legacy temporal para logo en base64. No usar como persistencia principal.',
      },
      {
        key: 'organization.sync.enabled',
        value: 'true',
        description: 'Activa los flujos de sincronizacion para la organizacion activa.',
      },
      {
        key: 'organization.audit.strict_mode',
        value: 'true',
        description: 'Habilita modo estricto de auditoria para operaciones criticas.',
      },
    ];

    for (const setting of settings) {
      await tx.setting.upsert({
        where: {
          organizationId_key: {
            organizationId,
            key: setting.key,
          },
        },
        update: {
          value: setting.value,
          description: setting.description,
          isActive: true,
        },
        create: {
          organizationId,
          key: setting.key,
          value: setting.value,
          description: setting.description,
          isActive: true,
        },
      });
    }
  }

  private async autoInstallCoreModules(
    tx: Prisma.TransactionClient,
    organizationId: string,
  ): Promise<void> {
    const coreModules = await tx.moduleDefinition.findMany({
      where: { isCore: true, lifecycleState: 'ACTIVE' },
      include: {
        versions: {
          orderBy: { publishedAt: 'desc' },
          take: 1,
        },
      },
    });

    for (const mod of coreModules) {
      const latestVersion = mod.versions[0]?.version;
      if (!latestVersion) continue;

      await tx.tenantModuleInstallation.upsert({
        where: {
          organizationId_moduleKey: {
            organizationId,
            moduleKey: mod.moduleKey,
          },
        },
        update: {},
        create: {
          organizationId,
          moduleKey: mod.moduleKey,
          version: latestVersion,
          status: 'INSTALLED',
        },
      });
    }
  }

  private validateSetupLogoFile(
    file: Express.Multer.File | undefined,
  ): asserts file is Express.Multer.File {
    if (!file) {
      throw new BadRequestException({
        statusCode: 400,
        code: ErrorCode.BAD_REQUEST,
        message: 'Archivo requerido en campo "file".',
        error: 'Bad Request',
      });
    }

    if (
      !ALLOWED_SETUP_LOGO_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_SETUP_LOGO_MIME_TYPES)[number],
      )
    ) {
      throw new BadRequestException({
        statusCode: 400,
        code: ErrorCode.FILE_TYPE_NOT_ALLOWED,
        message: 'El logo debe ser imagen JPEG, PNG o WEBP.',
        error: 'Bad Request',
      });
    }

    const extension = extname(file.originalname).toLowerCase();
    if (
      !ALLOWED_SETUP_LOGO_EXTENSIONS.includes(
        extension as (typeof ALLOWED_SETUP_LOGO_EXTENSIONS)[number],
      )
    ) {
      throw new BadRequestException({
        statusCode: 400,
        code: ErrorCode.FILE_EXTENSION_NOT_ALLOWED,
        message: 'La extension del logo no es valida.',
        error: 'Bad Request',
      });
    }
  }

  private async cleanupExpiredSetupUploads(): Promise<void> {
    const now = new Date();
    const expired = await this.prisma.setupUpload.findMany({
      where: {
        consumedAt: null,
        expiresAt: { lt: now },
      },
      select: {
        id: true,
        storagePath: true,
      },
      take: 50,
    });

    if (expired.length === 0) {
      return;
    }

    for (const upload of expired) {
      try {
        await this.storageService.removeObject(upload.storagePath);
      } catch {
        // ignore cleanup errors to avoid blocking setup flow
      }
    }

    await this.prisma.setupUpload.deleteMany({
      where: {
        id: { in: expired.map((item) => item.id) },
      },
    });
  }
}
