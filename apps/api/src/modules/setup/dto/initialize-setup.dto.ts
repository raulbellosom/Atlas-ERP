import {
  IsEmail,
  IsHexColor,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class InitializeSetupDto {
  // ─── Owner ─────────────────────────────────────────────────────────────────

  @IsEmail()
  ownerEmail!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  ownerFirstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  ownerLastName!: string;

  @IsString()
  @MinLength(8)
  ownerPassword!: string;

  // ─── Company Identity ──────────────────────────────────────────────────────

  @IsString()
  @MaxLength(160)
  businessLegalName!: string;

  @IsString()
  @MaxLength(160)
  businessName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  legalEntityType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(13)
  @Matches(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i, { message: 'RFC inválido' })
  rfc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  fiscalRegime?: string;

  // ─── Contact ───────────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;

  // ─── Address ───────────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  @MaxLength(255)
  street?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  // ─── Business Profile ──────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  @MaxLength(120)
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  companySize?: string;

  // ─── Branding ──────────────────────────────────────────────────────────────

  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  logoAttachmentId?: string;

  @IsOptional()
  @IsString()
  logoUploadToken?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  logoFileName?: string;
}
