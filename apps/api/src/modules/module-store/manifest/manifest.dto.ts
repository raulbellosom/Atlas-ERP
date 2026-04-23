import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ManifestDependencyDto {
  @IsString()
  @MinLength(1)
  moduleKey!: string;

  @IsString()
  @MinLength(1)
  versionConstraint!: string;

  @IsBoolean()
  @IsOptional()
  hard?: boolean = true;
}

export class ModuleManifestDto {
  @IsString()
  @MinLength(1)
  moduleKey!: string;

  @IsString()
  @MinLength(1)
  version!: string;

  @IsString()
  @MinLength(1)
  compatibility!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManifestDependencyDto)
  dependencies!: ManifestDependencyDto[];

  @IsArray()
  @IsString({ each: true })
  migrations!: string[];

  @IsArray()
  @IsString({ each: true })
  seeds!: string[];

  @IsArray()
  @IsString({ each: true })
  permissions!: string[];

  @IsObject()
  featureFlags!: Record<string, boolean>;

  @IsArray()
  @IsString({ each: true })
  uiSurfaces!: string[];
}
