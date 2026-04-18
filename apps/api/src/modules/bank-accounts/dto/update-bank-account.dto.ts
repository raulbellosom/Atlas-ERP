import { IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateBankAccountDto {
  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  bankAccountTypeId?: string;

  @IsOptional()
  @IsString()
  @Length(3, 120)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  bankName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  accountHolder?: string;

  @IsOptional()
  @IsString()
  @Length(4, 40)
  accountNumberMask?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currencyCode?: string;

  @IsOptional()
  @IsString()
  currentBalance?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
