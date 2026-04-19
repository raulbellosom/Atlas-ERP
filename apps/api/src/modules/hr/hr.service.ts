import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LeaveRequestStatus, SourceType } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { ListEmployeesQueryDto } from './dto/list-employees.query.dto';
import { ReviewLeaveRequestDto } from './dto/review-leave-request.dto';

@Injectable()
export class HrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ─── Department ────────────────────────────────────────────────────────────

  async createDepartment(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findFirst({
      where: { organizationId: dto.organizationId, name: dto.name, deletedAt: null },
    });
    if (existing) throw new ConflictException(`Departamento "${dto.name}" ya existe.`);

    const dept = await this.prisma.department.create({
      data: {
        organizationId: dto.organizationId,
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });

    await this.auditService.auditAction({
      organizationId: dto.organizationId,
      action: 'HR_DEPARTMENT_CREATED',
      entityType: 'department',
      entityId: dept.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: { name: dept.name },
    });

    return dept;
  }

  async listDepartments(organizationId: string) {
    return this.prisma.department.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async getDepartment(id: string) {
    const dept = await this.prisma.department.findFirst({ where: { id, deletedAt: null } });
    if (!dept) throw new NotFoundException('Departamento no encontrado.');
    return dept;
  }

  // ─── Position ──────────────────────────────────────────────────────────────

  async createPosition(dto: CreatePositionDto) {
    const existing = await this.prisma.position.findFirst({
      where: {
        organizationId: dto.organizationId,
        departmentId: dto.departmentId,
        name: dto.name,
        deletedAt: null,
      },
    });
    if (existing)
      throw new ConflictException(`Puesto "${dto.name}" ya existe en ese departamento.`);

    const pos = await this.prisma.position.create({
      data: {
        organizationId: dto.organizationId,
        departmentId: dto.departmentId,
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });

    await this.auditService.auditAction({
      organizationId: dto.organizationId,
      action: 'HR_POSITION_CREATED',
      entityType: 'position',
      entityId: pos.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: { name: pos.name, departmentId: pos.departmentId },
    });

    return pos;
  }

  async listPositions(organizationId: string, departmentId?: string) {
    return this.prisma.position.findMany({
      where: {
        organizationId,
        deletedAt: null,
        ...(departmentId ? { departmentId } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async getPosition(id: string) {
    const pos = await this.prisma.position.findFirst({ where: { id, deletedAt: null } });
    if (!pos) throw new NotFoundException('Puesto no encontrado.');
    return pos;
  }

  // ─── Employee ──────────────────────────────────────────────────────────────

  async createEmployee(dto: CreateEmployeeDto) {
    const existing = await this.prisma.employee.findFirst({
      where: { organizationId: dto.organizationId, employeeCode: dto.employeeCode },
    });
    if (existing)
      throw new ConflictException(`Empleado con código "${dto.employeeCode}" ya existe.`);

    const emp = await this.prisma.employee.create({
      data: {
        organizationId: dto.organizationId,
        departmentId: dto.departmentId,
        positionId: dto.positionId,
        employeeCode: dto.employeeCode,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        curp: dto.curp,
        rfc: dto.rfc,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        hireDate: new Date(dto.hireDate),
        status: dto.status,
      },
    });

    await this.auditService.auditAction({
      organizationId: dto.organizationId,
      action: 'HR_EMPLOYEE_CREATED',
      entityType: 'employee',
      entityId: emp.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        employeeCode: emp.employeeCode,
        firstName: emp.firstName,
        lastName: emp.lastName,
        status: emp.status,
      },
    });

    return emp;
  }

  async listEmployees(query: ListEmployeesQueryDto) {
    return this.prisma.employee.findMany({
      where: {
        organizationId: query.organizationId,
        deletedAt: null,
        ...(query.departmentId ? { departmentId: query.departmentId } : {}),
        ...(query.positionId ? { positionId: query.positionId } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      include: { department: true, position: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      ...(query.limit ? { take: query.limit } : {}),
    });
  }

  async getEmployee(id: string) {
    const emp = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: { department: true, position: true, contracts: true },
    });
    if (!emp) throw new NotFoundException('Empleado no encontrado.');
    return emp;
  }

  async terminateEmployee(id: string, actorId?: string) {
    const emp = await this.prisma.employee.findFirst({ where: { id, deletedAt: null } });
    if (!emp) throw new NotFoundException('Empleado no encontrado.');

    const updated = await this.prisma.employee.update({
      where: { id },
      data: { status: 'TERMINATED', deletedAt: new Date() },
    });

    await this.auditService.auditAction({
      organizationId: emp.organizationId,
      actorId,
      action: 'HR_EMPLOYEE_TERMINATED',
      entityType: 'employee',
      entityId: id,
      origin: SourceType.API,
      result: 'SUCCESS',
    });

    return updated;
  }

  // ─── Contract ──────────────────────────────────────────────────────────────

  async createContract(dto: CreateContractDto) {
    const emp = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, deletedAt: null },
    });
    if (!emp) throw new NotFoundException('Empleado no encontrado.');

    await this.prisma.contract.updateMany({
      where: { employeeId: dto.employeeId, isActive: true, deletedAt: null },
      data: { isActive: false },
    });

    const contract = await this.prisma.contract.create({
      data: {
        organizationId: dto.organizationId,
        employeeId: dto.employeeId,
        contractType: dto.contractType,
        baseSalary: dto.baseSalary,
        currencyCode: dto.currencyCode ?? 'MXN',
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        notes: dto.notes,
      },
    });

    await this.auditService.auditAction({
      organizationId: dto.organizationId,
      action: 'HR_CONTRACT_CREATED',
      entityType: 'contract',
      entityId: contract.id,
      origin: SourceType.API,
      result: 'SUCCESS',
      after: {
        employeeId: contract.employeeId,
        contractType: contract.contractType,
        baseSalary: contract.baseSalary.toString(),
      },
    });

    return contract;
  }

  async listContracts(employeeId: string) {
    return this.prisma.contract.findMany({
      where: { employeeId, deletedAt: null },
      orderBy: { startDate: 'desc' },
    });
  }

  // ─── LeaveRequest ──────────────────────────────────────────────────────────

  async createLeaveRequest(dto: CreateLeaveRequestDto) {
    const emp = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, deletedAt: null },
    });
    if (!emp) throw new NotFoundException('Empleado no encontrado.');

    return this.prisma.leaveRequest.create({
      data: {
        organizationId: dto.organizationId,
        employeeId: dto.employeeId,
        leaveType: dto.leaveType,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        days: dto.days,
        reason: dto.reason,
      },
    });
  }

  async listLeaveRequests(organizationId: string, employeeId?: string) {
    return this.prisma.leaveRequest.findMany({
      where: {
        organizationId,
        deletedAt: null,
        ...(employeeId ? { employeeId } : {}),
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async reviewLeaveRequest(id: string, dto: ReviewLeaveRequestDto) {
    const req = await this.prisma.leaveRequest.findFirst({ where: { id, deletedAt: null } });
    if (!req) throw new NotFoundException('Solicitud de ausencia no encontrada.');
    if (req.status !== LeaveRequestStatus.PENDING)
      throw new ConflictException('La solicitud ya fue procesada.');

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: dto.status,
        reviewedById: dto.reviewedById,
        reviewedAt: new Date(),
      },
    });
  }

  // ─── LeaveBalance ──────────────────────────────────────────────────────────

  async getLeaveBalances(employeeId: string, year: number) {
    return this.prisma.leaveBalance.findMany({
      where: { employeeId, year },
    });
  }

  // ─── EmployeeDocument ──────────────────────────────────────────────────────

  async listDocuments(employeeId: string) {
    const emp = await this.prisma.employee.findFirst({
      where: { id: employeeId, deletedAt: null },
    });
    if (!emp) throw new NotFoundException('Empleado no encontrado.');

    return this.prisma.employeeDocument.findMany({
      where: { employeeId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}
