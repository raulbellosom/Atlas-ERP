import { TransferStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateTransferDto {
  @IsString()
  organizationId!: string;

  @IsString()
  fromBankAccountId!: string;

  @IsString()
  toBankAccountId!: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  outgoingMovementId?: string;

  @IsOptional()
  @IsString()
  incomingMovementId?: string;

  @IsOptional()
  @IsString()
  initiatedById?: string;

  @IsOptional()
  @IsString()
  approvedById?: string;

  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;

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
}
