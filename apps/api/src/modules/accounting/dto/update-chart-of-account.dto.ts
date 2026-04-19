import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateChartOfAccountDto {
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
