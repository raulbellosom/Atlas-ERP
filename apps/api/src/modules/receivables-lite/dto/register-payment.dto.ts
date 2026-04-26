import { IsDateString, IsNumberString, IsString } from 'class-validator';

export class RegisterPaymentDto {
  @IsNumberString()
  amount!: string;

  @IsString()
  bankAccountId!: string;

  @IsDateString()
  occurredAt!: string;
}
