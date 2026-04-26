import { IsNotEmpty, IsString } from 'class-validator';

export class PurgeOrganizationDto {
  @IsNotEmpty()
  @IsString()
  password!: string;
}
