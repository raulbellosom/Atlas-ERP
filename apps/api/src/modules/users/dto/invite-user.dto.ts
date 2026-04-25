import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class InviteUserDto {
  @IsString()
  organizationId!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayName?: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  roleId?: string;
}
