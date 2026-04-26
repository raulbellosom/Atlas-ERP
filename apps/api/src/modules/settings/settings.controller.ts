import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req } from '@nestjs/common';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { type AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { OutboundEmailService } from '../notifications/outbound-email.service';
import { ListSettingsQueryDto } from './dto/list-settings.query.dto';
import { TestEmailOutboundDto } from './dto/test-email-outbound.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { UpsertEmailOutboundDto } from './dto/upsert-email-outbound.dto';
import { SettingsService } from './settings.service';

@Controller('v1/settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly outboundEmailService: OutboundEmailService,
  ) {}

  @Get()
  findAll(@Query() query: ListSettingsQueryDto) {
    return this.settingsService.findAll(query);
  }

  @Get('key/:key')
  findOneByKey(@Param('key') key: string, @Query('organizationId') organizationId?: string) {
    return this.settingsService.findOneByKey(key, organizationId);
  }

  @RequireAllPermissions('settings:write')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.update(id, dto);
  }

  @RequireAllPermissions('settings:read')
  @Get('email-outbound')
  getEmailOutboundConfig() {
    return this.settingsService.getEmailOutboundConfig();
  }

  @RequireAllPermissions('settings:write')
  @Put('email-outbound')
  updateEmailOutboundConfig(@Body() dto: UpsertEmailOutboundDto, @Req() req: AuthenticatedRequest) {
    return this.settingsService.upsertEmailOutboundConfig(dto, req.user?.sub);
  }

  @RequireAllPermissions('settings:write')
  @Post('email-outbound/test')
  async sendTestEmail(@Body() dto: TestEmailOutboundDto, @Req() req: AuthenticatedRequest) {
    const config = await this.settingsService.getRawEmailOutboundConfig();
    this.settingsService.assertValidEmailOutboundConfig(config);

    const recipient = dto.toEmail ?? config.fromEmail;

    await this.outboundEmailService.enqueueJob({
      type: 'EMAIL_OUTBOUND_TEST',
      toEmail: recipient,
      subject: 'Prueba de correo AtlasERP',
      htmlBody: [
        '<!doctype html>',
        '<html><body style="font-family:Arial,sans-serif;color:#111827;line-height:1.5">',
        '<p>Esta es una prueba de correo saliente de AtlasERP.</p>',
        '<p>Si recibiste este correo, la configuracion SMTP funciona.</p>',
        '</body></html>',
      ].join(''),
      textBody: 'Esta es una prueba de correo saliente de AtlasERP.',
      maxAttempts: 2,
    });

    return {
      queued: true,
      toEmail: recipient,
      requestedBy: req.user?.sub ?? null,
      message: 'Correo de prueba encolado para envio.',
    };
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.settingsService.findOneById(id);
  }
}
