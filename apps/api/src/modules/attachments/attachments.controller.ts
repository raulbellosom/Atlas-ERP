import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentOrganizationId } from '../../common/decorators/scope.decorator';
import { AttachmentsService } from './attachments.service';
import { MAX_ATTACHMENT_SIZE_BYTES } from './constants/file-policy.constants';
import { DownloadAttachmentQueryDto } from './dto/download-attachment.query.dto';
import { ListAttachmentsQueryDto } from './dto/list-attachments.query.dto';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';

@Controller('v1/attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_ATTACHMENT_SIZE_BYTES,
      },
    }),
  )
  upload(
    @Body() body: UploadAttachmentDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentOrganizationId() requesterOrganizationId?: string,
  ) {
    return this.attachmentsService.uploadAttachment(
      body,
      file,
      requesterOrganizationId,
    );
  }

  @Get()
  findAll(@Query() query: ListAttachmentsQueryDto) {
    return this.attachmentsService.findAll(query);
  }

  @Get('entity/:entityType/:entityId')
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('includeDeleted', new DefaultValuePipe(false), ParseBoolPipe)
    includeDeleted: boolean,
  ) {
    return this.attachmentsService.findByEntity(
      entityType,
      entityId,
      includeDeleted,
    );
  }

  @Get(':id/download')
  download(
    @Param('id') id: string,
    @Query() query: DownloadAttachmentQueryDto,
    @CurrentOrganizationId() requesterOrganizationId?: string,
  ) {
    return this.attachmentsService.generateSecureDownload(
      id,
      query,
      requesterOrganizationId,
    );
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.attachmentsService.findOneById(id);
  }
}
