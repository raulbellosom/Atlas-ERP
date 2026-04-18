import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListSettingsQueryDto } from './dto/list-settings.query.dto';
import { SettingsService } from './settings.service';

@Controller('v1/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll(@Query() query: ListSettingsQueryDto) {
    return this.settingsService.findAll(query);
  }

  @Get('key/:key')
  findOneByKey(
    @Param('key') key: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.settingsService.findOneByKey(key, organizationId);
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.settingsService.findOneById(id);
  }
}
