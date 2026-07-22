import { okResult, Result } from '@pormeldev/axis-common-lib';
import type {
  AuthorizationError,
  AuthorizationRequest,
  AuthorizationResponse,
  AuthorizationService,
} from '@pormeldev/axis-service-authorization';

export class AllowAllAuthorizationService implements AuthorizationService {
  isAuthorized(_request: AuthorizationRequest): Promise<Result<boolean, AuthorizationError>> {
    return Promise.resolve(okResult(true));
  }

  areAuthorized(requests: AuthorizationRequest[]): Promise<AuthorizationResponse[]> {
    return Promise.resolve(requests.map((request) => ({ request, result: okResult(true) })));
  }
}
