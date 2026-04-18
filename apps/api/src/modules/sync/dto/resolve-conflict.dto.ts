import { ConflictResolutionAction } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ResolveConflictDto {
  @IsEnum(ConflictResolutionAction)
  action!: ConflictResolutionAction;

  @IsOptional()
  @IsString()
  reason?: string;
}
