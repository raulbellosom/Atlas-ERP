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
import { RequireModuleInstalled } from '../../common/decorators/module-install.decorator';
import { CreateCounterpartyLiteDto } from './dto/create-counterparty-lite.dto';
import { UpdateCounterpartyLiteDto } from './dto/update-counterparty-lite.dto';
import { ListCounterpartiesLiteQueryDto } from './dto/list-counterparties-lite.query.dto';
import { CounterpartiesLiteService } from './counterparties-lite.service';

// Reusing receivable permissions since counterparty is part of finops
@RequireModuleInstalled('financial-operations')
@Controller('v1/counterparties-lite')
export class CounterpartiesLiteController {
  constructor(private readonly counterpartiesLiteService: CounterpartiesLiteService) {}

  @RequireAllPermissions('finops:receivable:write')
  @Post()
  create(@Body() dto: CreateCounterpartyLiteDto) {
    return this.counterpartiesLiteService.create(dto);
  }

  @RequireAllPermissions('finops:receivable:read')
  @Get()
  findAll(@Query() query: ListCounterpartiesLiteQueryDto) {
    return this.counterpartiesLiteService.findAll(query);
  }

  @RequireAllPermissions('finops:receivable:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.counterpartiesLiteService.findOneById(id);
  }

  @RequireAllPermissions('finops:receivable:write')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCounterpartyLiteDto) {
    const updated = await this.counterpartiesLiteService.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Contraparte no encontrada.');
    }
    return updated;
  }

  @RequireAllPermissions('finops:receivable:write')
  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    const deleted = await this.counterpartiesLiteService.softDelete(id);
    if (!deleted) {
      throw new NotFoundException('Contraparte no encontrada.');
    }
    return { deleted: true };
  }
}
