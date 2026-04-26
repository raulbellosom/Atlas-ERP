import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAttachmentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  filename?: string;
}
