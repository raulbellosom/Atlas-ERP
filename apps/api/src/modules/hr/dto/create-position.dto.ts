import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  organizationId!: string;

  @IsString()
  departmentId!: string;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
