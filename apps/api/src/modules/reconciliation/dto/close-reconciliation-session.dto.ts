import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CloseReconciliationSessionDto {
  @IsOptional()
  @IsString()
  closedById?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  force?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  notes?: string;
}
