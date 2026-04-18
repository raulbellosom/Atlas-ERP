import { IsOptional, IsString, MinLength } from 'class-validator';

export class BranchScopeQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  branchId?: string;
}
