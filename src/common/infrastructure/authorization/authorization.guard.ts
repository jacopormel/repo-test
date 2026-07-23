import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AxisUser } from '@pormeldev/axis-common-lib';
import { DateTime } from '@pormeldev/axis-common-lib';
import type { AuthorizationService } from '@pormeldev/axis-service-authorization';
import { AXIS_AUTHORIZATION_SERVICE, Context } from '@pormeldev/axis-service-authorization';
import type { RequiredPermission } from './require-permission.decorator';
import { PERMISSION_METADATA_KEY } from './require-permission.decorator';

export const OPEN_ENDPOINT_METADATA_KEY = 'axis:isOpen';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    @Inject(AXIS_AUTHORIZATION_SERVICE)
    private readonly authorizationService: AuthorizationService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isOpen = this.reflector.get<boolean>(OPEN_ENDPOINT_METADATA_KEY, context.getHandler());
    if (isOpen) {
      return true;
    }

    const required = this.reflector.get<RequiredPermission | undefined>(
      PERMISSION_METADATA_KEY,
      context.getHandler(),
    );
    if (!required) {
      throw new ForbiddenException(
        'Endpoint has no @RequirePermission or @OpenEndpoint decorator - denying by default.',
      );
    }

    const request = context.switchToHttp().getRequest();
    const principal: AxisUser | undefined = request.requestContext?.user;
    if (!principal) {
      throw new ForbiddenException('No authenticated user available for authorization check.');
    }

    const result = await this.authorizationService.isAuthorized({
      principal,
      action: required.action,
      resource: {
        type: required.resourceType,
        id: request.params?.id ?? '*',
      },
      context: new Context(DateTime.now(), request.ip),
    });

    if (!result.ok) {
      throw new InternalServerErrorException(result.errors);
    }
    if (!result.value) {
      throw new ForbiddenException('Not authorized to perform this action.');
    }

    return true;
  }
}
