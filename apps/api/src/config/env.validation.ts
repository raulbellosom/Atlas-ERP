/**
 * AtlasERP API — Validacion de variables de entorno al arranque.
 * Principio canon: "fail fast" — la app no arranca si falta configuracion obligatoria.
 * Referencia: docs/02-architecture/10-estrategia-environment-variables.md
 *
 * Se usa con @nestjs/config: ConfigModule.forRoot({ validate })
 */
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Min, validateSync } from 'class-validator';

type NodeEnvType = 'development' | 'production' | 'test';

class EnvironmentVariables {
  // ── Base de datos ──────────────────────────────────────────────────────────
  @IsString()
  DATABASE_URL!: string;

  // ── Redis ──────────────────────────────────────────────────────────────────
  @IsString()
  REDIS_HOST!: string;

  @IsInt()
  @Min(1)
  REDIS_PORT!: number;

  // ── S3 / MinIO ────────────────────────────────────────────────────────────
  @IsUrl({ require_tld: false })
  S3_ENDPOINT!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  S3_PUBLIC_URL?: string;

  @IsString()
  S3_ACCESS_KEY!: string;

  @IsString()
  S3_SECRET_KEY!: string;

  @IsString()
  S3_BUCKET!: string;

  @IsOptional()
  @IsString()
  S3_REGION?: string;

  @IsOptional()
  @IsInt()
  @Min(60)
  S3_PRESIGNED_EXPIRY_SECONDS?: number;

  // ── JWT ───────────────────────────────────────────────────────────────────
  @IsString()
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  WEB_APP_URL?: string;

  // ── Servidor ──────────────────────────────────────────────────────────────
  @IsOptional()
  @IsInt()
  @Min(1)
  PORT?: number;

  @IsEnum(['development', 'production', 'test'] as const)
  NODE_ENV!: NodeEnvType;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`[AtlasERP API] Configuracion de entorno invalida:\n${errors.toString()}`);
  }

  return validatedConfig;
}
