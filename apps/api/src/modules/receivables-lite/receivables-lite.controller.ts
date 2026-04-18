import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { CreateReceivableLiteDto } from './dto/create-receivable-lite.dto';
import { ListReceivablesLiteQueryDto } from './dto/list-receivables-lite.query.dto';
import { UpdateReceivableLiteDto } from './dto/update-receivable-lite.dto';
import { ReceivablesLiteService } from './receivables-lite.service';

@Controller('v1/receivables-lite')
export class ReceivablesLiteController {
  constructor(
    private readonly receivablesLiteService: ReceivablesLiteService,
  ) {}

  @RequireAllPermissions('finops:receivable:write')
  @Post()
  create(@Body() dto: CreateReceivableLiteDto) {
    return this.receivablesLiteService.create(dto);
  }

  @RequireAllPermissions('finops:receivable:read')
  @Get()
  findAll(@Query() query: ListReceivablesLiteQueryDto) {
    return this.receivablesLiteService.findAll(query);
  }

  @RequireAllPermissions('finops:receivable:read')
  @Get('organization/:organizationId/overdue-count')
  countOverdueByOrganization(@Param('organizationId') organizationId: string) {
    return this.receivablesLiteService.countOverdueByOrganization(organizationId);
  }

  @RequireAllPermissions('finops:receivable:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receivablesLiteService.findOneById(id);
  }

  @RequireAllPermissions('finops:receivable:write')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateReceivableLiteDto) {
    const updated = await this.receivablesLiteService.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Cuenta por cobrar no encontrada.');
    }
    return updated;
  }

  @RequireAllPermissions('finops:receivable:write')
  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    const deleted = await this.receivablesLiteService.softDelete(id);
    if (!deleted) {
      throw new NotFoundException('Cuenta por cobrar no encontrada.');
    }
    return { deleted: true };
  }
}
