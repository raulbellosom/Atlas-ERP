import { Type } from 'class-transformer';
import { FinancialMovementStatus, FinancialMovementType } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ListFinancialMovementsQueryDto {
  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  bankAccountId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsOptional()
  @IsEnum(FinancialMovementType)
  movementType?: FinancialMovementType;

  @IsOptional()
  @IsEnum(FinancialMovementStatus)
  status?: FinancialMovementStatus;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isReconciled?: boolean;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}
