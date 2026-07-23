import { ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { AxisUser } from '@pormeldev/axis-common-lib';
import { errorResult, okResult } from '@pormeldev/axis-common-lib';
import type { AuthorizationError, AuthorizationService } from '@pormeldev/axis-service-authorization';
import { AuthorizationGuard, OPEN_ENDPOINT_METADATA_KEY } from '../authorization.guard';
import { PERMISSION_METADATA_KEY } from '../require-permission.decorator';
import type { RequiredPermission } from '../require-permission.decorator';

function createExecutionContext(options: {
  user?: AxisUser;
  params?: Record<string, string>;
}): ExecutionContext {
  const request = {
    requestContext: options.user ? { user: options.user } : undefined,
    params: options.params ?? {},
    ip: '127.0.0.1',
  };

  return {
    getHandler: () => jest.fn(),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

function createReflectorMock(
  required: RequiredPermission | undefined,
  isOpen = false,
): jest.Mocked<Reflector> {
  return {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === OPEN_ENDPOINT_METADATA_KEY) return isOpen;
      if (key === PERMISSION_METADATA_KEY) return required;
      return undefined;
    }),
  } as unknown as jest.Mocked<Reflector>;
}

function createAuthorizationServiceMock(): jest.Mocked<AuthorizationService> {
  return {
    isAuthorized: jest.fn(),
    areAuthorized: jest.fn(),
  };
}

const principal = { id: 'user-1' } as AxisUser;

describe('AuthorizationGuard', () => {
  it('denies the request when neither @RequirePermission nor @OpenEndpoint metadata is present (fail-closed)', async () => {
    const reflector = createReflectorMock(undefined);
    const authorizationService = createAuthorizationServiceMock();
    const guard = new AuthorizationGuard(authorizationService, reflector);

    await expect(
      guard.canActivate(createExecutionContext({ user: principal })),
    ).rejects.toThrow(ForbiddenException);
    expect(authorizationService.isAuthorized).not.toHaveBeenCalled();
  });

  it('allows the request when @OpenEndpoint metadata is present, regardless of @RequirePermission', async () => {
    const reflector = createReflectorMock(undefined, true);
    const authorizationService = createAuthorizationServiceMock();
    const guard = new AuthorizationGuard(authorizationService, reflector);

    const result = await guard.canActivate(createExecutionContext({}));

    expect(result).toBe(true);
    expect(authorizationService.isAuthorized).not.toHaveBeenCalled();
  });

  it('throws Forbidden when a permission is required but there is no authenticated principal', async () => {
    const reflector = createReflectorMock({ action: 'Delete', resourceType: 'GovernmentAgency' });
    const authorizationService = createAuthorizationServiceMock();
    const guard = new AuthorizationGuard(authorizationService, reflector);

    await expect(guard.canActivate(createExecutionContext({}))).rejects.toThrow(ForbiddenException);
    expect(authorizationService.isAuthorized).not.toHaveBeenCalled();
  });

  it('allows the request when the authorization service grants access', async () => {
    const reflector = createReflectorMock({ action: 'Delete', resourceType: 'GovernmentAgency' });
    const authorizationService = createAuthorizationServiceMock();
    authorizationService.isAuthorized.mockResolvedValue(okResult(true));
    const guard = new AuthorizationGuard(authorizationService, reflector);

    const result = await guard.canActivate(
      createExecutionContext({ user: principal, params: { id: 'agency-1' } }),
    );

    expect(result).toBe(true);
    expect(authorizationService.isAuthorized).toHaveBeenCalledTimes(1);
    const request = authorizationService.isAuthorized.mock.calls[0][0];
    expect(request.principal).toBe(principal);
    expect(request.action).toBe('Delete');
    expect(request.resource).toEqual({ type: 'GovernmentAgency', id: 'agency-1' });
  });

  it('defaults resource id to "*" when the route has no id param', async () => {
    const reflector = createReflectorMock({ action: 'List', resourceType: 'GovernmentAgency' });
    const authorizationService = createAuthorizationServiceMock();
    authorizationService.isAuthorized.mockResolvedValue(okResult(true));
    const guard = new AuthorizationGuard(authorizationService, reflector);

    await guard.canActivate(createExecutionContext({ user: principal }));

    const request = authorizationService.isAuthorized.mock.calls[0][0];
    expect(request.resource).toEqual({ type: 'GovernmentAgency', id: '*' });
  });

  it('throws Forbidden when the authorization service denies access', async () => {
    const reflector = createReflectorMock({ action: 'Delete', resourceType: 'GovernmentAgency' });
    const authorizationService = createAuthorizationServiceMock();
    authorizationService.isAuthorized.mockResolvedValue(okResult(false));
    const guard = new AuthorizationGuard(authorizationService, reflector);

    await expect(
      guard.canActivate(createExecutionContext({ user: principal, params: { id: 'agency-1' } })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws InternalServerError when the authorization service itself fails', async () => {
    const reflector = createReflectorMock({ action: 'Delete', resourceType: 'GovernmentAgency' });
    const authorizationService = createAuthorizationServiceMock();
    authorizationService.isAuthorized.mockResolvedValue(
      errorResult([{ message: 'AWSVP unavailable' } as AuthorizationError]),
    );
    const guard = new AuthorizationGuard(authorizationService, reflector);

    await expect(
      guard.canActivate(createExecutionContext({ user: principal, params: { id: 'agency-1' } })),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
