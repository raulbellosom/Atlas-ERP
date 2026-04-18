import { SetMetadata } from '@nestjs/common';
import {
  PERMISSIONS_ALL_KEY,
  PERMISSIONS_ANY_KEY,
} from '../constants/authorization.constants';

export const RequireAllPermissions = (...permissions: string[]): MethodDecorator &
  ClassDecorator => SetMetadata(PERMISSIONS_ALL_KEY, permissions);

export const RequireAnyPermission = (...permissions: string[]): MethodDecorator &
  ClassDecorator => SetMetadata(PERMISSIONS_ANY_KEY, permissions);
