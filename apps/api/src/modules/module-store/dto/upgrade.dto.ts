import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpgradeModuleDto {
  @IsString()
  @MinLength(1)
  organizationId!: string;

  @IsString()
  @MinLength(1)
  moduleKey!: string;

  @IsString()
  @MinLength(1)
  fromVersion!: string;

  @IsString()
  @MinLength(1)
  toVersion!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  requestId?: string;
}
