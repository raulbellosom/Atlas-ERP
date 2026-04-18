import { SetMetadata } from '@nestjs/common';
import { PUBLIC_ROUTE_KEY } from '../constants/auth.constants';

export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(PUBLIC_ROUTE_KEY, true);
