import { IsString, MinLength } from 'class-validator';

export class AddVersionDto {
  @IsString()
  @MinLength(1)
  version!: string;

  @IsString()
  @MinLength(1)
  compatibilityRange!: string;

  @IsString()
  @MinLength(1)
  manifestChecksum!: string;
}
