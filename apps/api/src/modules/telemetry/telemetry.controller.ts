import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

interface ClientErrorDto {
  type?: string;
  error?: string;
  stack?: string;
  componentStack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  route?: string;
  userId?: string;
  timestamp?: string;
}

@Controller('telemetry')
export class TelemetryController {
  private readonly logger = new Logger(TelemetryController.name);

  @Public()
  @Post('client-error')
  @HttpCode(204)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  reportClientError(@Body() body: ClientErrorDto): void {
    this.logger.error(
      JSON.stringify({
        event: 'CLIENT_JS_ERROR',
        type: body.type,
        error: body.error,
        route: body.route,
        userId: body.userId,
        timestamp: body.timestamp,
      }),
    );
  }
}
