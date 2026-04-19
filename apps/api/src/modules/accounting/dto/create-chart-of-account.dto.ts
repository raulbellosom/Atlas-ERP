import { AccountType } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreateChartOfAccountDto {
  @IsString()
  organizationId!: string;

  @IsString()
  @Length(2, 20)
  code!: string;

  @IsString()
  @Length(2, 120)
  name!: string;

  @IsEnum(AccountType)
  accountType!: AccountType;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
