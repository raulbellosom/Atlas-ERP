import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  organizationId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(120)
  displayName!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
