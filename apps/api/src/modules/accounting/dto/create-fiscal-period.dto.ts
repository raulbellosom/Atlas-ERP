import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateFiscalPeriodDto {
  @IsString()
  organizationId!: string;

  @IsInt()
  @Min(2020)
  @Max(2100)
  year!: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;
}
