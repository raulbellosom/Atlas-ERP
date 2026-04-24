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
import { CreateTransferDto } from './dto/create-transfer.dto';
import { ListTransfersQueryDto } from './dto/list-transfers.query.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { TransfersService } from './transfers.service';
import { RequireModuleInstalled } from '../../common/decorators/module-install.decorator';

@RequireModuleInstalled('financial-operations')
@Controller('v1/transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @RequireAllPermissions('finops:transfer:write')
  @Post()
  create(@Body() dto: CreateTransferDto) {
    return this.transfersService.create(dto);
  }

  @RequireAllPermissions('finops:transfer:read')
  @Get()
  findAll(@Query() query: ListTransfersQueryDto) {
    return this.transfersService.findAll(query);
  }

  @RequireAllPermissions('finops:transfer:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transfersService.findOneById(id);
  }

  @RequireAllPermissions('finops:transfer:write')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTransferDto) {
    const updated = await this.transfersService.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Transferencia no encontrada.');
    }
    return updated;
  }

  @RequireAllPermissions('finops:transfer:write')
  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    const deleted = await this.transfersService.softDelete(id);
    if (!deleted) {
      throw new NotFoundException('Transferencia no encontrada.');
    }
    return { deleted: true };
  }
}
