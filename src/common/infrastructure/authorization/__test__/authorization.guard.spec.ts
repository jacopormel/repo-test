import { ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { AxisUser } from '@pormeldev/axis-common-lib';
import { errorResult, okResult } from '@pormeldev/axis-common-lib';
import type { AuthorizationError, AuthorizationService } from '@pormeldev/axis-service-authorization';
import { AuthorizationGuard } from '../authorization.guard';
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

function createReflectorMock(required: RequiredPermission | undefined): jest.Mocked<Reflector> {
  return {
    get: jest.fn().mockReturnValue(required),
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
  // Pins the current fail-open behavior: an endpoint guarded by AuthorizationGuard
  // but missing @RequirePermission is allowed through with no authorization check
  // at all. This is a known gap (see audit) - if it's fixed to fail-closed, this
  // test is the one that should flip to expect a denial.
  it('allows the request when no @RequirePermission metadata is present (fail-open)', async () => {
    const reflector = createReflectorMock(undefined);
    const authorizationService = createAuthorizationServiceMock();
    const guard = new AuthorizationGuard(authorizationService, reflector);

    const result = await guard.canActivate(createExecutionContext({ user: principal }));

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
