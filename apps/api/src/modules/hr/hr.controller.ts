import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { ListEmployeesQueryDto } from './dto/list-employees.query.dto';
import { ReviewLeaveRequestDto } from './dto/review-leave-request.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { HrService } from './hr.service';

@Controller('v1/hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // ─── Departments ───────────────────────────────────────────────────────────

  @Post('departments')
  @RequireAllPermissions('hr:write')
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.hrService.createDepartment(dto);
  }

  @Get('departments')
  @RequireAllPermissions('hr:read')
  listDepartments(@Query('organizationId') organizationId: string) {
    return this.hrService.listDepartments(organizationId);
  }

  @Get('departments/:id')
  @RequireAllPermissions('hr:read')
  getDepartment(@Param('id') id: string) {
    return this.hrService.getDepartment(id);
  }

  // ─── Positions ─────────────────────────────────────────────────────────────

  @Post('positions')
  @RequireAllPermissions('hr:write')
  createPosition(@Body() dto: CreatePositionDto) {
    return this.hrService.createPosition(dto);
  }

  @Get('positions')
  @RequireAllPermissions('hr:read')
  listPositions(
    @Query('organizationId') organizationId: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.hrService.listPositions(organizationId, departmentId);
  }

  @Get('positions/:id')
  @RequireAllPermissions('hr:read')
  getPosition(@Param('id') id: string) {
    return this.hrService.getPosition(id);
  }

  // ─── Employees ─────────────────────────────────────────────────────────────

  @Post('employees')
  @RequireAllPermissions('hr:write')
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.hrService.createEmployee(dto);
  }

  @Get('employees')
  @RequireAllPermissions('hr:read')
  listEmployees(@Query() query: ListEmployeesQueryDto) {
    return this.hrService.listEmployees(query);
  }

  @Get('employees/:id')
  @RequireAllPermissions('hr:read')
  getEmployee(@Param('id') id: string) {
    return this.hrService.getEmployee(id);
  }

  @Patch('employees/:id')
  @RequireAllPermissions('hr:write')
  updateEmployee(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.hrService.updateEmployee(id, dto);
  }

  @Delete('employees/:id')
  @RequireAllPermissions('hr:admin')
  terminateEmployee(@Param('id') id: string, @Query('actorId') actorId?: string) {
    return this.hrService.terminateEmployee(id, actorId);
  }

  // ─── Contracts ─────────────────────────────────────────────────────────────

  @Post('contracts')
  @RequireAllPermissions('hr:write')
  createContract(@Body() dto: CreateContractDto) {
    return this.hrService.createContract(dto);
  }

  @Get('employees/:id/contracts')
  @RequireAllPermissions('hr:read')
  listContracts(@Param('id') employeeId: string) {
    return this.hrService.listContracts(employeeId);
  }

  // ─── Leave Requests ────────────────────────────────────────────────────────

  @Post('leave-requests')
  @RequireAllPermissions('hr:write')
  createLeaveRequest(@Body() dto: CreateLeaveRequestDto) {
    return this.hrService.createLeaveRequest(dto);
  }

  @Get('leave-requests')
  @RequireAllPermissions('hr:read')
  listLeaveRequests(
    @Query('organizationId') organizationId: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.hrService.listLeaveRequests(organizationId, employeeId);
  }

  @Put('leave-requests/:id/review')
  @RequireAllPermissions('hr:write')
  reviewLeaveRequest(@Param('id') id: string, @Body() dto: ReviewLeaveRequestDto) {
    return this.hrService.reviewLeaveRequest(id, dto);
  }

  // ─── Leave Balances ────────────────────────────────────────────────────────

  @Get('employees/:id/leave-balances')
  @RequireAllPermissions('hr:read')
  getLeaveBalances(@Param('id') employeeId: string, @Query('year') year: string) {
    return this.hrService.getLeaveBalances(employeeId, parseInt(year, 10));
  }
}
