import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { RequireAllPermissions } from '../../common/decorators/permissions.decorator';
import { ListFeatureFlagsQueryDto } from './dto/list-feature-flags.query.dto';
import { FeatureFlagsService } from './feature-flags.service';

@Controller('v1/feature-flags')
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get()
  findAll(@Query() query: ListFeatureFlagsQueryDto) {
    return this.featureFlagsService.findAll(query);
  }

  @Get(':key')
  findOneByKey(@Param('key') key: string) {
    return this.featureFlagsService.findOneByKey(key);
  }

  @RequireAllPermissions('feature_flags:write')
  @Patch(':key/toggle')
  toggle(@Param('key') key: string) {
    return this.featureFlagsService.toggle(key);
  }
}
