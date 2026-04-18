import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class ReconcileSessionDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  autoResolveDiscrepancies?: boolean;

  @IsOptional()
  @IsString()
  resolvedById?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string;
}
