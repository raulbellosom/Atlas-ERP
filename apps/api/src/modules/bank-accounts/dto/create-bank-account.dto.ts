import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateBankAccountDto {
  @IsString()
  organizationId!: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  bankAccountTypeId?: string;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsString()
  @Length(3, 120)
  name!: string;

  @IsString()
  @Length(2, 120)
  bankName!: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  accountHolder?: string;

  @IsString()
  @Length(4, 40)
  accountNumberMask!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currencyCode?: string;

  @IsOptional()
  @IsString()
  currentBalance?: string;
}
