import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Public } from '../../common/decorators/public.decorator';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';
import { InitializeSetupDto } from './dto/initialize-setup.dto';
import { SetupService } from './setup.service';

@Controller('v1/setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Public()
  @Get('status')
  getStatus() {
    return this.setupService.getStatus();
  }

  @Public()
  @RateLimit({ limit: 10, windowMs: 60_000 })
  @Post('logo-upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadLogo(@UploadedFile() file: Express.Multer.File | undefined) {
    return this.setupService.uploadLogo(file);
  }

  @Public()
  @RateLimit({ limit: 5, windowMs: 60_000 })
  @Post('initialize')
  initialize(@Body() dto: InitializeSetupDto) {
    return this.setupService.initialize(dto);
  }
}
