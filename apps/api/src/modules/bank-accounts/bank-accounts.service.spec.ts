import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BankAccountsService } from './bank-accounts.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { prismaMock } from '../../test-utils/mocks/prisma.mock';
import { auditMock } from '../../test-utils/mocks/audit.mock';
import { bankAccountFactory } from '../../test-utils/factories/bank-account.factory';

describe('BankAccountsService', () => {
  let service: BankAccountsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankAccountsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: auditMock },
      ],
    }).compile();
    service = module.get<BankAccountsService>(BankAccountsService);
  });

  describe('create', () => {
    it('crea una cuenta bancaria y registra auditoría', async () => {
      const account = bankAccountFactory({ name: 'Caja Principal' });
      prismaMock.bankAccount.create.mockResolvedValue(account);

      const result = await service.create({
        organizationId: 'org-1',
        name: 'Caja Principal',
        bankName: 'BBVA',
        accountNumberMask: '****1234',
        currencyCode: 'MXN',
        createdById: 'user-1',
      } as any);

      expect(result.name).toBe('Caja Principal');
      expect(prismaMock.bankAccount.create).toHaveBeenCalledTimes(1);
      expect(auditMock.auditAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('retorna una lista de cuentas bancarias', async () => {
      const accounts = [bankAccountFactory(), bankAccountFactory()];
      prismaMock.bankAccount.findMany.mockResolvedValue(accounts);

      const result = await service.findAll({ organizationId: 'org-1' } as any);

      expect(result).toHaveLength(2);
      expect(prismaMock.bankAccount.findMany).toHaveBeenCalledTimes(1);
    });

    it('retorna array vacío cuando no hay cuentas', async () => {
      prismaMock.bankAccount.findMany.mockResolvedValue([]);

      const result = await service.findAll({ organizationId: 'org-1' } as any);

      expect(result).toHaveLength(0);
    });
  });

  describe('findOneById', () => {
    it('retorna la cuenta cuando existe', async () => {
      const account = bankAccountFactory();
      prismaMock.bankAccount.findFirst.mockResolvedValue(account);

      const result = await service.findOneById(account.id);

      expect(result).toEqual(account);
    });

    it('retorna null cuando la cuenta no existe', async () => {
      prismaMock.bankAccount.findFirst.mockResolvedValue(null);

      const result = await service.findOneById('no-existe');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('actualiza los campos permitidos y retorna la cuenta actualizada', async () => {
      const existing = bankAccountFactory();
      const updated = { ...existing, name: 'Caja Actualizada' };
      prismaMock.bankAccount.findFirst.mockResolvedValue(existing);
      prismaMock.bankAccount.update.mockResolvedValue(updated);

      const result = await service.update(existing.id, { name: 'Caja Actualizada' } as any);

      expect(result?.name).toBe('Caja Actualizada');
      expect(auditMock.auditAction).toHaveBeenCalledTimes(1);
    });

    it('retorna null cuando la cuenta a actualizar no existe', async () => {
      prismaMock.bankAccount.findFirst.mockResolvedValue(null);

      const result = await service.update('no-existe', { name: 'X' } as any);

      expect(result).toBeNull();
      expect(prismaMock.bankAccount.update).not.toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('aplica soft delete y retorna true cuando la cuenta existe', async () => {
      const account = bankAccountFactory();
      prismaMock.bankAccount.findFirst.mockResolvedValue(account);
      prismaMock.bankAccount.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.softDelete(account.id);

      expect(result).toBe(true);
      expect(prismaMock.bankAccount.delete).not.toHaveBeenCalled();
      expect(auditMock.auditAction).toHaveBeenCalledTimes(1);
    });

    it('retorna false cuando la cuenta no existe', async () => {
      prismaMock.bankAccount.findFirst.mockResolvedValue(null);

      const result = await service.softDelete('no-existe');

      expect(result).toBe(false);
      expect(prismaMock.bankAccount.updateMany).not.toHaveBeenCalled();
    });
  });
});
