import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListPermissionsQueryDto } from './dto/list-permissions.query.dto';
import { PermissionsService } from './permissions.service';

@Controller('v1/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  findAll(@Query() query: ListPermissionsQueryDto) {
    return this.permissionsService.findAll(query);
  }

  @Get(':key')
  findOneByKey(@Param('key') key: string) {
    return this.permissionsService.findOneByKey(key);
  }
}
