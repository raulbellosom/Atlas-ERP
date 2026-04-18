import { SyncSessionStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination';

export class ListSyncSessionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  deviceRegistryId?: string;

  @IsOptional()
  @IsEnum(SyncSessionStatus)
  status?: SyncSessionStatus;
}
