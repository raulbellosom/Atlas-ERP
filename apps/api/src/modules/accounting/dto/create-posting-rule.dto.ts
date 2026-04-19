import { PostingMovementType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreatePostingRuleDto {
  @IsString()
  organizationId!: string;

  @IsString()
  categoryCode!: string;

  @IsEnum(PostingMovementType)
  movementType!: PostingMovementType;

  @IsString()
  debitAccountId!: string;

  @IsString()
  creditAccountId!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
