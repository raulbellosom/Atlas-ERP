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
import { CreatePayableLiteDto } from './dto/create-payable-lite.dto';
import { ListPayablesLiteQueryDto } from './dto/list-payables-lite.query.dto';
import { UpdatePayableLiteDto } from './dto/update-payable-lite.dto';
import { PayablesLiteService } from './payables-lite.service';

@Controller('v1/payables-lite')
export class PayablesLiteController {
  constructor(private readonly payablesLiteService: PayablesLiteService) {}

  @RequireAllPermissions('finops:payable:write')
  @Post()
  create(@Body() dto: CreatePayableLiteDto) {
    return this.payablesLiteService.create(dto);
  }

  @RequireAllPermissions('finops:payable:read')
  @Get()
  findAll(@Query() query: ListPayablesLiteQueryDto) {
    return this.payablesLiteService.findAll(query);
  }

  @RequireAllPermissions('finops:payable:read')
  @Get('organization/:organizationId/overdue-count')
  countOverdueByOrganization(@Param('organizationId') organizationId: string) {
    return this.payablesLiteService.countOverdueByOrganization(organizationId);
  }

  @RequireAllPermissions('finops:payable:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payablesLiteService.findOneById(id);
  }

  @RequireAllPermissions('finops:payable:write')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePayableLiteDto) {
    const updated = await this.payablesLiteService.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Cuenta por pagar no encontrada.');
    }
    return updated;
  }

  @RequireAllPermissions('finops:payable:write')
  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    const deleted = await this.payablesLiteService.softDelete(id);
    if (!deleted) {
      throw new NotFoundException('Cuenta por pagar no encontrada.');
    }
    return { deleted: true };
  }
}
