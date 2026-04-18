import { FinancialMovementStatus, FinancialMovementType } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateFinancialMovementDto {
  @IsString()
  organizationId!: string;

  @IsString()
  bankAccountId!: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsEnum(FinancialMovementType)
  movementType!: FinancialMovementType;

  @IsOptional()
  @IsEnum(FinancialMovementStatus)
  status?: FinancialMovementStatus;

  @IsString()
  amount!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currencyCode?: string;

  @IsDateString()
  occurredAt!: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  reference?: string;

  @IsOptional()
  @IsBoolean()
  isReconciled?: boolean;
}
