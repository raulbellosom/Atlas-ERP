import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BalanceSnapshotsService } from './balance-snapshots.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { prismaMock } from '../../test-utils/mocks/prisma.mock';
import { balanceSnapshotFactory } from '../../test-utils/factories/balance-snapshot.factory';

describe('BalanceSnapshotsService', () => {
  let service: BalanceSnapshotsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceSnapshotsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<BalanceSnapshotsService>(BalanceSnapshotsService);
  });

  describe('create', () => {
    it('crea un snapshot de saldo con los datos proporcionados', async () => {
      const snapshot = balanceSnapshotFactory({ balance: '10000', currencyCode: 'MXN' });
      prismaMock.balanceSnapshot.create.mockResolvedValue(snapshot);

      const result = await service.create({
        organizationId: 'org-1',
        bankAccountId: 'ba-1',
        snapshotAt: '2026-01-31T23:59:59Z',
        balance: '10000',
        currencyCode: 'MXN',
        source: 'MANUAL',
      });

      expect(result.balance).toBe('10000');
      expect(prismaMock.balanceSnapshot.create).toHaveBeenCalledTimes(1);
    });

    it('usa MXN como moneda por defecto cuando no se especifica', async () => {
      const snapshot = balanceSnapshotFactory({ currencyCode: 'MXN' });
      prismaMock.balanceSnapshot.create.mockResolvedValue(snapshot);

      await service.create({
        organizationId: 'org-1',
        bankAccountId: 'ba-1',
        snapshotAt: '2026-01-31T23:59:59Z',
        balance: '5000',
      });

      const callArgs = prismaMock.balanceSnapshot.create.mock.calls[0][0];
      expect(callArgs.data.currencyCode).toBe('MXN');
    });
  });

  describe('findAll', () => {
    it('retorna lista de snapshots de la organización', async () => {
      const snapshots = [balanceSnapshotFactory(), balanceSnapshotFactory()];
      prismaMock.balanceSnapshot.findMany.mockResolvedValue(snapshots);

      const result = await service.findAll({ organizationId: 'org-1' } as any);

      expect(result).toHaveLength(2);
    });

    it('retorna array vacío si no hay snapshots', async () => {
      prismaMock.balanceSnapshot.findMany.mockResolvedValue([]);

      const result = await service.findAll({ organizationId: 'org-1' } as any);

      expect(result).toHaveLength(0);
    });
  });
});
