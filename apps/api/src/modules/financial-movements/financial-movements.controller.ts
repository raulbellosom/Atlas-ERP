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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { CurrentOrganizationId } from '../../common/decorators/scope.decorator';
import { MAX_ATTACHMENT_SIZE_BYTES } from '../attachments/constants/file-policy.constants';
import { CreateFinancialMovementDto } from './dto/create-financial-movement.dto';
import { ListFinancialMovementsQueryDto } from './dto/list-financial-movements.query.dto';
import { UploadMovementAttachmentDto } from './dto/upload-movement-attachment.dto';
import { UpdateFinancialMovementDto } from './dto/update-financial-movement.dto';
import { FinancialMovementsService } from './financial-movements.service';

@Controller('v1/financial-movements')
export class FinancialMovementsController {
  constructor(
    private readonly financialMovementsService: FinancialMovementsService,
  ) {}

  @RequireAllPermissions('finops:financial_movement:write')
  @Post()
  create(@Body() dto: CreateFinancialMovementDto) {
    return this.financialMovementsService.create(dto);
  }

  @RequireAllPermissions('finops:financial_movement:read')
  @Get()
  findAll(@Query() query: ListFinancialMovementsQueryDto) {
    return this.financialMovementsService.findAll(query);
  }

  @RequireAllPermissions('finops:financial_movement:read')
  @Get('by-filters')
  findAllByFilters(@Query() query: ListFinancialMovementsQueryDto) {
    return this.financialMovementsService.findAll(query);
  }

  @RequireAllPermissions('finops:financial_movement:read')
  @Get(':id/attachments')
  listProofs(@Param('id') id: string) {
    return this.financialMovementsService.listProofs(id);
  }

  @RequireAllPermissions('finops:financial_movement:write', 'finops:attachment:write')
  @Post(':id/attachments/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_ATTACHMENT_SIZE_BYTES,
      },
    }),
  )
  uploadProof(
    @Param('id') id: string,
    @Body() dto: UploadMovementAttachmentDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentOrganizationId() requesterOrganizationId?: string,
  ) {
    return this.financialMovementsService.uploadProof(
      id,
      dto,
      file,
      requesterOrganizationId,
    );
  }

  @RequireAllPermissions('finops:financial_movement:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.financialMovementsService.findOneById(id);
  }

  @RequireAllPermissions('finops:financial_movement:write')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFinancialMovementDto,
  ) {
    const updated = await this.financialMovementsService.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Movimiento financiero no encontrado.');
    }
    return updated;
  }

  @RequireAllPermissions('finops:financial_movement:write')
  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    const deleted = await this.financialMovementsService.softDelete(id);
    if (!deleted) {
      throw new NotFoundException('Movimiento financiero no encontrado.');
    }
    return { deleted: true };
  }
}
