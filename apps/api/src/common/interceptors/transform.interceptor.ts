import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { serializeResponseValue } from '../serialization/serialize-response.util';

/**
 * Estructura envolvente de toda respuesta exitosa de la API.
 */
export interface ApiResponse {
  data: unknown;
  meta: {
    timestamp: string;
  };
}

/**
 * Interceptor global de transformacion de respuestas.
 *
 * Envuelve toda respuesta exitosa (2xx) en un sobre consistente:
 * {
 *   data:      <payload original>,
 *   meta:      { timestamp: string },
 * }
 *
 * Las respuestas de error pasan por AllExceptionsFilter, no por este interceptor.
 *
 * Referencia: T-0607
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse> {
    return next.handle().pipe(
      map((data) => ({
        data: serializeResponseValue(data),
        meta: {
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
