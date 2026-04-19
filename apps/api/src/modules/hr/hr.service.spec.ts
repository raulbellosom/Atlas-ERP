import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { prismaMock } from '../../test-utils/mocks/prisma.mock';
import { auditMock } from '../../test-utils/mocks/audit.mock';
import { HrService } from './hr.service';

const mockDept = {
  id: 'dept-1',
  organizationId: 'org-1',
  name: 'Administración',
  description: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockPosition = {
  id: 'pos-1',
  organizationId: 'org-1',
  departmentId: 'dept-1',
  name: 'Director General',
  description: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockEmployee = {
  id: 'emp-1',
  organizationId: 'org-1',
  departmentId: 'dept-1',
  positionId: 'pos-1',
  employeeCode: 'EMP-001',
  firstName: 'Carlos',
  lastName: 'García',
  email: 'carlos@demo.com',
  phone: null,
  curp: null,
  rfc: null,
  birthDate: null,
  hireDate: new Date('2020-01-15'),
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockLeaveRequest = {
  id: 'lr-1',
  organizationId: 'org-1',
  employeeId: 'emp-1',
  leaveType: 'VACATION',
  status: 'PENDING',
  startDate: new Date('2026-05-01'),
  endDate: new Date('2026-05-05'),
  days: 5,
  reason: null,
  reviewedById: null,
  reviewedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('HrService', () => {
  let service: HrService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: auditMock },
      ],
    }).compile();
    service = module.get<HrService>(HrService);
  });

  describe('createDepartment', () => {
    it('creates a department successfully', async () => {
      prismaMock.department.findFirst.mockResolvedValue(null);
      prismaMock.department.create.mockResolvedValue(mockDept);

      const result = await service.createDepartment({
        organizationId: 'org-1',
        name: 'Administración',
      });

      expect(result.name).toBe('Administración');
      expect(prismaMock.department.create).toHaveBeenCalledTimes(1);
      expect(auditMock.auditAction).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException if department name already exists', async () => {
      prismaMock.department.findFirst.mockResolvedValue(mockDept);

      await expect(
        service.createDepartment({ organizationId: 'org-1', name: 'Administración' }),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.department.create).not.toHaveBeenCalled();
    });
  });

  describe('createEmployee', () => {
    it('creates an employee successfully', async () => {
      prismaMock.employee.findFirst.mockResolvedValue(null);
      prismaMock.employee.create.mockResolvedValue(mockEmployee);

      const result = await service.createEmployee({
        organizationId: 'org-1',
        employeeCode: 'EMP-001',
        firstName: 'Carlos',
        lastName: 'García',
        hireDate: '2020-01-15',
      });

      expect(result.employeeCode).toBe('EMP-001');
      expect(prismaMock.employee.create).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException if employeeCode already exists', async () => {
      prismaMock.employee.findFirst.mockResolvedValue(mockEmployee);

      await expect(
        service.createEmployee({
          organizationId: 'org-1',
          employeeCode: 'EMP-001',
          firstName: 'Carlos',
          lastName: 'García',
          hireDate: '2020-01-15',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getEmployee', () => {
    it('returns employee when found', async () => {
      prismaMock.employee.findFirst.mockResolvedValue({
        ...mockEmployee,
        department: mockDept,
        position: mockPosition,
        contracts: [],
      });

      const result = await service.getEmployee('emp-1');
      expect(result.id).toBe('emp-1');
    });

    it('throws NotFoundException when employee not found', async () => {
      prismaMock.employee.findFirst.mockResolvedValue(null);
      await expect(service.getEmployee('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('reviewLeaveRequest', () => {
    it('approves a pending leave request', async () => {
      prismaMock.leaveRequest.findFirst.mockResolvedValue(mockLeaveRequest);
      prismaMock.leaveRequest.update.mockResolvedValue({
        ...mockLeaveRequest,
        status: 'APPROVED',
        reviewedById: 'user-1',
        reviewedAt: new Date(),
      });

      const result = await service.reviewLeaveRequest('lr-1', {
        reviewedById: 'user-1',
        status: 'APPROVED' as any,
      });

      expect(result.status).toBe('APPROVED');
      expect(prismaMock.leaveRequest.update).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundException when leave request not found', async () => {
      prismaMock.leaveRequest.findFirst.mockResolvedValue(null);
      await expect(
        service.reviewLeaveRequest('nonexistent', {
          reviewedById: 'user-1',
          status: 'APPROVED' as any,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when leave request already processed', async () => {
      prismaMock.leaveRequest.findFirst.mockResolvedValue({
        ...mockLeaveRequest,
        status: 'APPROVED',
      });

      await expect(
        service.reviewLeaveRequest('lr-1', { reviewedById: 'user-1', status: 'REJECTED' as any }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
