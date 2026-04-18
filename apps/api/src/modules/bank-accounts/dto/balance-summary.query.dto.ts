import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class BalanceSummaryQueryDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeInactive?: boolean;
}
