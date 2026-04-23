import { IsOptional, IsString, MinLength } from 'class-validator';

export class UninstallModuleDto {
  @IsString()
  @MinLength(1)
  organizationId!: string;

  @IsString()
  @MinLength(1)
  moduleKey!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  requestId?: string;
}
