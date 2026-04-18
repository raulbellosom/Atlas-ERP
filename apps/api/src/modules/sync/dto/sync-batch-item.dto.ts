import {
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

/** Entidades que el sync batch acepta desde clientes desktop/web. */
export const ALLOWED_SYNC_ENTITIES = [
  'setting',
  'feature_flag',
  'attachment',
  'device_registry',
  'bank_account',
  'financial_movement',
  'financial_transfer',
  'receivable',
  'payable',
  'reconciliation_session',
] as const;

/** Operaciones soportadas. */
export const ALLOWED_SYNC_OPERATIONS = [
  'create',
  'update',
  'upsert',
  'delete',
] as const;

export class SyncBatchItemDto {
  @IsNotEmpty()
  @IsString()
  itemId!: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(ALLOWED_SYNC_ENTITIES, {
    message: `entity debe ser uno de: ${ALLOWED_SYNC_ENTITIES.join(', ')}`,
  })
  entity!: string;

  @IsNotEmpty()
  @IsString()
  entityId!: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(ALLOWED_SYNC_OPERATIONS, {
    message: `operation debe ser una de: ${ALLOWED_SYNC_OPERATIONS.join(', ')}`,
  })
  operation!: string;

  @IsObject()
  payload!: Record<string, unknown>;

  @IsNotEmpty()
  @IsString()
  idempotencyKey!: string;

  @IsOptional()
  @IsString()
  fingerprint?: string;

  @IsOptional()
  @IsISO8601()
  occurredAt?: string;

  @IsOptional()
  @IsString()
  source?: string;
}
