import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { RATE_LIMIT_KEY, type RateLimitOptions } from '../decorators/rate-limit.decorator';

interface BucketEntry {
  count: number;
  resetAt: number;
}

/**
 * In-memory sliding-window rate limiter.
 * Keyed by `${routeKey}:${clientIp}`.
 * Suitable for single-instance deployments (dev/staging).
 * For multi-instance prod, replace with Redis-backed solution.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly buckets = new Map<string, BucketEntry>();

  constructor(private readonly reflector: Reflector) {
    // Prune expired buckets every 5 minutes to avoid unbounded memory growth
    setInterval(() => this.prune(), 5 * 60 * 1000);
  }

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions | undefined>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip ?? request.socket?.remoteAddress ?? 'unknown';
    const routeKey = `${request.method}:${request.route?.path ?? request.path}`;
    const bucketKey = `${routeKey}:${ip}`;

    const now = Date.now();
    const entry = this.buckets.get(bucketKey);

    if (!entry || now >= entry.resetAt) {
      this.buckets.set(bucketKey, { count: 1, resetAt: now + options.windowMs });
      return true;
    }

    entry.count += 1;

    if (entry.count > options.limit) {
      this.logger.warn(`Rate limit exceeded: ${bucketKey} (${entry.count}/${options.limit})`);
      throw new HttpException(
        'Demasiadas solicitudes. Por favor, intente de nuevo más tarde.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.buckets) {
      if (now >= entry.resetAt) this.buckets.delete(key);
    }
  }
}
