import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SyncBatchItemDto } from './sync-batch-item.dto';

export class SyncBatchRequestDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'El batch debe contener al menos 1 item.' })
  @ArrayMaxSize(100, { message: 'El batch no puede superar 100 items.' })
  @ValidateNested({ each: true })
  @Type(() => SyncBatchItemDto)
  items!: SyncBatchItemDto[];

  /** ID del device registry desde el que se origina la sesion. */
  @IsOptional()
  @IsString()
  deviceRegistryId?: string;
}
