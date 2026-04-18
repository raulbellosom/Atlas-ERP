import { ReconciliationSessionStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateReconciliationSessionDto {
  @IsOptional()
  @IsString()
  bankAccountId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  openedById?: string;

  @IsOptional()
  @IsString()
  closedById?: string;

  @IsOptional()
  @IsEnum(ReconciliationSessionStatus)
  status?: ReconciliationSessionStatus;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  closedAt?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  notes?: string;
}
