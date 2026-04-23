import { IsString, MinLength } from 'class-validator';

export class InstallModuleDto {
  @IsString()
  @MinLength(1)
  organizationId!: string;

  @IsString()
  @MinLength(1)
  moduleKey!: string;

  @IsString()
  @MinLength(1)
  version!: string;
}
