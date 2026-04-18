import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';

/**
 * HealthController — endpoint de salud de la API.
 *
 * GET /api/health
 * Usado por:
 *   - Docker healthcheck (docker-compose.staging.yml y prod.yml)
 *   - nginx depends_on condition: service_healthy
 *   - Monitoreo externo (uptime checks)
 *
 * Responde 200 OK si el proceso esta corriendo.
 * La comprobacion de conectividad a BD y Redis se agrega en Fase 7+.
 */
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }
}
