import { LeaveType } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsString()
  organizationId!: string;

  @IsString()
  employeeId!: string;

  @IsEnum(LeaveType)
  leaveType!: LeaveType;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsNumber()
  @Min(0.5)
  days!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
