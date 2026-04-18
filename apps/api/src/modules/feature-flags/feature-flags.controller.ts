import { Controller, Get, Param, Query } from '@nestjs/common';
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
}
