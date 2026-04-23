import { lazy } from 'react';

const ModuleStorePage = lazy(() => import('./pages/ModuleStorePage'));

export const moduleStoreRoutes = [{ index: true, element: ModuleStorePage }];

export const MODULE_STORE_PERMISSIONS = {
  READ: 'module_store:read',
  INSTALL: 'module_store:install',
  UNINSTALL: 'module_store:uninstall',
  UPGRADE: 'module_store:upgrade',
  ADMIN: 'module_store:admin',
};
