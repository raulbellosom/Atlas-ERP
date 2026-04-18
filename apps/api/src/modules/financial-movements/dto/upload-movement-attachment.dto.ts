import { IsOptional, IsString, Length } from 'class-validator';

export class UploadMovementAttachmentDto {
  @IsString()
  organizationId!: string;

  @IsOptional()
  @IsString()
  uploadedById?: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  note?: string;
}
