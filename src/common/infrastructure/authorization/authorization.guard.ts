import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DateTime } from '@pormeldev/axis-common-lib';
import type { AxisUser } from '@pormeldev/axis-common-lib';
import { AXIS_AUTHORIZATION_SERVICE, Context } from '@pormeldev/axis-service-authorization';
import type { AuthorizationService } from '@pormeldev/axis-service-authorization';
import type { RequiredPermission } from './require-permission.decorator';
import { PERMISSION_METADATA_KEY } from './require-permission.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    @Inject(AXIS_AUTHORIZATION_SERVICE)
    private readonly authorizationService: AuthorizationService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<RequiredPermission | undefined>(
      PERMISSION_METADATA_KEY,
      context.getHandler(),
    );
    if (!required) {
      return true;
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
