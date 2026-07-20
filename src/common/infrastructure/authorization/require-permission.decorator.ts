import { SetMetadata } from '@nestjs/common';

export const PERMISSION_METADATA_KEY = 'axis:requiredPermission';

export interface RequiredPermission {
  action: string;
  resourceType: string;
}

export const RequirePermission = (action: string, resourceType: string) =>
  SetMetadata(PERMISSION_METADATA_KEY, { action, resourceType } satisfies RequiredPermission);
