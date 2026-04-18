/**
 * Logger base de AtlasERP API.
 *
 * Patron de uso en cualquier servicio o controlador NestJS:
 *
 * ```typescript
 * import { Logger } from '@nestjs/common';
 *
 * @Injectable()
 * export class MiServicio {
 *   private readonly logger = new Logger(MiServicio.name);
 *
 *   miMetodo() {
 *     this.logger.log('Mensaje informativo');
 *     this.logger.debug('Solo visible en development');
 *     this.logger.warn('Advertencia');
 *     this.logger.error('Error', optionalStack);
 *   }
 * }
 * ```
 *
 * Los niveles activos se configuran en main.ts segun NODE_ENV:
 * - development: log, debug, verbose, warn, error
 * - production:  log, warn, error
 * - test:        warn, error
 *
 * Referencia: T-0605
 */

export { Logger } from '@nestjs/common';
