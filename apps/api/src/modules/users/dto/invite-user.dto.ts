import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class InviteUserDto {
  @IsString()
  organizationId!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayName?: string;

  @IsOptional()
  @IsString()
  roleId?: string;
}
