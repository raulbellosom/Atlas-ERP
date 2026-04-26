import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateMovementAttachmentDto {
  @IsOptional()
  @IsString()
  @Length(1, 300)
  note?: string;
}
