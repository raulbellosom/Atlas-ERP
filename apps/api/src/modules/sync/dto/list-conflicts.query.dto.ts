import { ConflictStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination';

export class ListConflictsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsEnum(ConflictStatus)
  status?: ConflictStatus;
}
