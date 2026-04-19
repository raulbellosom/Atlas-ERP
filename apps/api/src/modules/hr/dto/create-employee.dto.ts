import { EmploymentStatus } from '@prisma/client';
import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  organizationId!: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsString()
  @MaxLength(40)
  employeeCode!: string;

  @IsString()
  @MaxLength(80)
  firstName!: string;

  @IsString()
  @MaxLength(80)
  lastName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(18)
  curp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(13)
  rfc?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsDateString()
  hireDate!: string;

  @IsOptional()
  @IsEnum(EmploymentStatus)
  status?: EmploymentStatus;
}
