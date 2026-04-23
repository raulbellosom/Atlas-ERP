import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';

@Controller('v1/module-store')
export class ModuleStoreController {
  @Public()
  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}
