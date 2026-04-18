/**
 * AtlasERP Worker — Validacion de variables de entorno al arranque.
 * Principio canon: "fail fast".
 * Referencia: docs/02-architecture/10-estrategia-environment-variables.md
 */
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  validateSync,
} from 'class-validator';

type NodeEnvType = 'development' | 'production' | 'test';

class WorkerEnvironmentVariables {
  // ── Base de datos ──────────────────────────────────────────────────────────
  @IsString()
  DATABASE_URL!: string;

  // ── Redis (BullMQ) ────────────────────────────────────────────────────────
  @IsString()
  REDIS_HOST!: string;

  @IsInt()
  @Min(1)
  REDIS_PORT!: number;

  // ── S3 / MinIO ────────────────────────────────────────────────────────────
  @IsUrl({ require_tld: false })
  S3_ENDPOINT!: string;

  @IsString()
  S3_ACCESS_KEY!: string;

  @IsString()
  S3_SECRET_KEY!: string;

  @IsString()
  S3_BUCKET!: string;

  @IsOptional()
  @IsString()
  S3_REGION?: string;

  // ── Entorno ───────────────────────────────────────────────────────────────
  @IsEnum(['development', 'production', 'test'] as const)
  NODE_ENV!: NodeEnvType;
}

export function validateEnv(config: Record<string, unknown>): WorkerEnvironmentVariables {
  const validatedConfig = plainToInstance(WorkerEnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `[AtlasERP Worker] Configuracion de entorno invalida:\n${errors.toString()}`,
    );
  }

  return validatedConfig;
}
