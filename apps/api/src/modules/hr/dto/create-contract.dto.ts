import { ContractType } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateContractDto {
  @IsString()
  organizationId!: string;

  @IsString()
  employeeId!: string;

  @IsEnum(ContractType)
  contractType!: ContractType;

  @IsNumber()
  @Min(0)
  baseSalary!: number;

  @IsOptional()
  @IsString()
  currencyCode?: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
