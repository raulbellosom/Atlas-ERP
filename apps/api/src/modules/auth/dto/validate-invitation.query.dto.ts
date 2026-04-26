import { IsString, MinLength } from 'class-validator';

export class ValidateInvitationQueryDto {
  @IsString()
  @MinLength(16)
  token!: string;
}
