import { SetMetadata } from '@nestjs/common';

export const PERMISSION_METADATA_KEY = 'axis:requiredPermission';

export interface RequiredPermission {
  action: string;
  resourceType: string;
}

/**
 * `resourceType` must match the resource type name defined in the configured
 * policy store/schema (see AGENTS.md: resource.type is not cosmetic).
 */
export const RequirePermission = (action: string, resourceType: string) =>
  SetMetadata(PERMISSION_METADATA_KEY, { action, resourceType } satisfies RequiredPermission);
