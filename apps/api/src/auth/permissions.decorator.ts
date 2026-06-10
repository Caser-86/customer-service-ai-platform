import { SetMetadata } from '@nestjs/common';
import { Permission } from './permissions';
import { PERMISSIONS_KEY } from './rbac.guard';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
