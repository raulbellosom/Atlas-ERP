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
  Req,
} from '@nestjs/common';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { type AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { CreateReceivableLiteDto } from './dto/create-receivable-lite.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';
import { ListReceivablesLiteQueryDto } from './dto/list-receivables-lite.query.dto';
import { UpdateReceivableLiteDto } from './dto/update-receivable-lite.dto';
import { ReceivablesLiteService } from './receivables-lite.service';
import { RequireModuleInstalled } from '../../common/decorators/module-install.decorator';

@RequireModuleInstalled('financial-operations')
@Controller('v1/receivables-lite')
export class ReceivablesLiteController {
  constructor(private readonly receivablesLiteService: ReceivablesLiteService) {}

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

  @RequireAllPermissions('finops:receivable:write')
  @Post(':id/payments')
  async registerPayment(
    @Param('id') id: string,
    @Body() dto: RegisterPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub ?? '';
    const updated = await this.receivablesLiteService.registerPayment(id, dto, userId);
    if (!updated) {
      throw new NotFoundException('Cuenta por cobrar no encontrada.');
    }
    return updated;
  }
}
