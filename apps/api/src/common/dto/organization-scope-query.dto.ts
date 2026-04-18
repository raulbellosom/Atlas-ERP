import { IsOptional, IsString, MinLength } from 'class-validator';

export class OrganizationScopeQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  organizationId?: string;
}
