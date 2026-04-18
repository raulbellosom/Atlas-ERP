import { Type } from 'class-transformer';
import { ReconciliationItemStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListReconciliationItemsQueryDto {
  @IsOptional()
  @IsEnum(ReconciliationItemStatus)
  status?: ReconciliationItemStatus;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  resolvedOnly?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}
