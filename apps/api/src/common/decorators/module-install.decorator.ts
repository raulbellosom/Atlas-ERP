import { SetMetadata } from '@nestjs/common';
import { MODULE_INSTALL_KEY } from '../constants/authorization.constants';

export const RequireModuleInstalled = (moduleKey: string): MethodDecorator & ClassDecorator =>
  SetMetadata(MODULE_INSTALL_KEY, moduleKey);
