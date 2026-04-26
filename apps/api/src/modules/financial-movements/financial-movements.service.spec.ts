import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FinancialMovementsService } from './financial-movements.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { prismaMock } from '../../test-utils/mocks/prisma.mock';
import { auditMock } from '../../test-utils/mocks/audit.mock';
import { attachmentsMock } from '../../test-utils/mocks/attachments.mock';
import { financialMovementFactory } from '../../test-utils/factories/financial-movement.factory';

const eventEmitterMock = { emit: jest.fn() };

describe('FinancialMovementsService', () => {
  let service: FinancialMovementsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialMovementsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: auditMock },
        { provide: AttachmentsService, useValue: attachmentsMock },
        { provide: EventEmitter2, useValue: eventEmitterMock },
      ],
    }).compile();
    service = module.get<FinancialMovementsService>(FinancialMovementsService);
  });

  describe('create', () => {
    it('registra un movimiento financiero y audita la acción', async () => {
      const movement = financialMovementFactory({ movementType: 'CREDIT', amount: '500' });
      prismaMock.financialMovement.create.mockResolvedValue(movement);

      const result = await service.create({
        organizationId: 'org-1',
        bankAccountId: 'ba-1',
        createdById: 'user-1',
        movementType: 'CREDIT',
        amount: '500',
        currencyCode: 'MXN',
        occurredAt: '2026-01-15T00:00:00Z',
        description: 'Ingreso de prueba',
      } as any);

      expect(result.amount).toBe('500');
      expect(prismaMock.financialMovement.create).toHaveBeenCalledTimes(1);
      expect(auditMock.auditAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('retorna lista de movimientos filtrados por organización', async () => {
      const movements = [financialMovementFactory(), financialMovementFactory()];
      prismaMock.financialMovement.findMany.mockResolvedValue(movements);

      const result = await service.findAll({ organizationId: 'org-1' } as any);

      expect(result).toHaveLength(2);
    });

    it('filtra por bankAccountId cuando se proporciona', async () => {
      const movements = [financialMovementFactory({ bankAccountId: 'ba-1' })];
      prismaMock.financialMovement.findMany.mockResolvedValue(movements);

      const result = await service.findAll({
        organizationId: 'org-1',
        bankAccountId: 'ba-1',
      } as any);

      expect(result).toHaveLength(1);
      expect(result[0].bankAccountId).toBe('ba-1');
    });
  });

  describe('findOneById', () => {
    it('retorna el movimiento cuando existe', async () => {
      const movement = financialMovementFactory();
      prismaMock.financialMovement.findFirst.mockResolvedValue(movement);

      const result = await service.findOneById(movement.id);

      expect(result).toEqual(movement);
    });

    it('retorna null cuando el movimiento no existe', async () => {
      prismaMock.financialMovement.findFirst.mockResolvedValue(null);

      const result = await service.findOneById('no-existe');

      expect(result).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('aplica soft delete y retorna true cuando el movimiento existe', async () => {
      const movement = financialMovementFactory();
      prismaMock.financialMovement.findFirst.mockResolvedValue(movement);
      prismaMock.financialMovement.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.softDelete(movement.id);

      expect(result).toBe(true);
      expect(auditMock.auditAction).toHaveBeenCalledTimes(1);
    });

    it('retorna false cuando el movimiento no existe', async () => {
      prismaMock.financialMovement.findFirst.mockResolvedValue(null);

      const result = await service.softDelete('no-existe');

      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('actualiza el movimiento y retorna el resultado actualizado', async () => {
      const movement = financialMovementFactory();
      const updated = { ...movement, description: 'Actualizado' };
      prismaMock.financialMovement.findFirst.mockResolvedValue(movement);
      prismaMock.financialMovement.update.mockResolvedValue(updated);

      const result = await service.update(movement.id, { description: 'Actualizado' } as any);

      expect(result?.description).toBe('Actualizado');
      expect(auditMock.auditAction).toHaveBeenCalledTimes(1);
    });

    it('retorna null cuando el movimiento a actualizar no existe', async () => {
      prismaMock.financialMovement.findFirst.mockResolvedValue(null);

      const result = await service.update('no-existe', { description: 'X' } as any);

      expect(result).toBeNull();
    });
  });
});
