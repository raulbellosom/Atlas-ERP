import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TransfersService } from './transfers.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { prismaMock } from '../../test-utils/mocks/prisma.mock';
import { auditMock } from '../../test-utils/mocks/audit.mock';
import { transferFactory } from '../../test-utils/factories/transfer.factory';

const eventEmitterMock = { emit: jest.fn() };

describe('TransfersService', () => {
  let service: TransfersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransfersService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: auditMock },
        { provide: EventEmitter2, useValue: eventEmitterMock },
      ],
    }).compile();
    service = module.get<TransfersService>(TransfersService);
  });

  describe('create', () => {
    it('crea una transferencia y registra auditoría', async () => {
      const transfer = transferFactory({ fromBankAccountId: 'ba-1', toBankAccountId: 'ba-2' });
      prismaMock.transfer.create.mockResolvedValue(transfer);

      const result = await service.create({
        organizationId: 'org-1',
        fromBankAccountId: 'ba-1',
        toBankAccountId: 'ba-2',
        initiatedById: 'user-1',
        amount: '500',
        currencyCode: 'MXN',
        occurredAt: '2026-01-15T00:00:00Z',
        description: 'Transferencia de prueba',
      } as any);

      expect(result.fromBankAccountId).toBe('ba-1');
      expect(result.toBankAccountId).toBe('ba-2');
      expect(prismaMock.transfer.create).toHaveBeenCalledTimes(1);
      expect(auditMock.auditAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('retorna lista de transferencias de la organización', async () => {
      const transfers = [transferFactory(), transferFactory()];
      prismaMock.transfer.findMany.mockResolvedValue(transfers);

      const result = await service.findAll({ organizationId: 'org-1' } as any);

      expect(result).toHaveLength(2);
    });

    it('retorna array vacío si no hay transferencias', async () => {
      prismaMock.transfer.findMany.mockResolvedValue([]);

      const result = await service.findAll({ organizationId: 'org-1' } as any);

      expect(result).toHaveLength(0);
    });
  });

  describe('findOneById', () => {
    it('retorna la transferencia cuando existe', async () => {
      const transfer = transferFactory();
      prismaMock.transfer.findFirst.mockResolvedValue(transfer);

      const result = await service.findOneById(transfer.id);

      expect(result).toEqual(transfer);
    });

    it('retorna null cuando la transferencia no existe', async () => {
      prismaMock.transfer.findFirst.mockResolvedValue(null);

      const result = await service.findOneById('no-existe');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('actualiza la transferencia y retorna el resultado', async () => {
      const transfer = transferFactory();
      const updated = { ...transfer, description: 'Actualizada' };
      prismaMock.transfer.findFirst.mockResolvedValue(transfer);
      prismaMock.transfer.update.mockResolvedValue(updated);

      const result = await service.update(transfer.id, { description: 'Actualizada' } as any);

      expect(result?.description).toBe('Actualizada');
    });

    it('retorna null cuando la transferencia a actualizar no existe', async () => {
      prismaMock.transfer.findFirst.mockResolvedValue(null);

      const result = await service.update('no-existe', { description: 'X' } as any);

      expect(result).toBeNull();
    });
  });
});
