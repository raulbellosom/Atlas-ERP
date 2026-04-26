import { CounterpartyType, CounterpartyStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class ListCounterpartiesLiteQueryDto {
  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsEnum(CounterpartyType)
  type?: CounterpartyType;

  @IsOptional()
  @IsEnum(CounterpartyStatus)
  status?: CounterpartyStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  limit?: number;
}
