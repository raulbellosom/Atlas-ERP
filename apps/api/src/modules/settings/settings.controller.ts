import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { ListSettingsQueryDto } from './dto/list-settings.query.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingsService } from './settings.service';

@Controller('v1/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll(@Query() query: ListSettingsQueryDto) {
    return this.settingsService.findAll(query);
  }

  @Get('key/:key')
  findOneByKey(@Param('key') key: string, @Query('organizationId') organizationId?: string) {
    return this.settingsService.findOneByKey(key, organizationId);
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.settingsService.findOneById(id);
  }

  @RequireAllPermissions('settings:write')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.update(id, dto);
  }
}
