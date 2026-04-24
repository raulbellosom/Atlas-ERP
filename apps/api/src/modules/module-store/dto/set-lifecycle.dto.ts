import { IsEnum } from 'class-validator';

export class SetLifecycleDto {
  @IsEnum(['ACTIVE', 'DEPRECATED', 'DISABLED'])
  lifecycleState!: 'ACTIVE' | 'DEPRECATED' | 'DISABLED';
}
