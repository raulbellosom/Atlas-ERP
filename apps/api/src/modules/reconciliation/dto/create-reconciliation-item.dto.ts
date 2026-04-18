import { ReconciliationItemStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateReconciliationItemDto {
  @IsString()
  organizationId!: string;

  @IsString()
  reconciliationSessionId!: string;

  @IsString()
  financialMovementId!: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsEnum(ReconciliationItemStatus)
  status?: ReconciliationItemStatus;

  @IsOptional()
  @IsString()
  expectedAmount?: string;

  @IsOptional()
  @IsString()
  actualAmount?: string;

  @IsOptional()
  @IsString()
  discrepancyAmount?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string;

  @IsOptional()
  @IsString()
  resolvedById?: string;

  @IsOptional()
  @IsDateString()
  resolvedAt?: string;
}
