import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ModuleManifestDto } from './manifest.dto';

const CORE_MODULE_KEYS = new Set(['core-platform']);

export interface ManifestValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

@Injectable()
export class ManifestValidatorService {
  async validate(raw: unknown): Promise<ManifestValidationResult> {
    const instance = plainToInstance(ModuleManifestDto, raw);
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: false,
      skipMissingProperties: false,
    });
    return { valid: errors.length === 0, errors };
  }

  isCore(moduleKey: string): boolean {
    return CORE_MODULE_KEYS.has(moduleKey);
  }
}
