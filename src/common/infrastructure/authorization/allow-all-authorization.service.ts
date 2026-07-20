import { okResult, Result } from '@pormeldev/axis-common-lib';
import type {
  AuthorizationError,
  AuthorizationRequest,
  AuthorizationResponse,
  AuthorizationService,
} from '@pormeldev/axis-service-authorization';

export class AllowAllAuthorizationService implements AuthorizationService {
  async isAuthorized(_request: AuthorizationRequest): Promise<Result<boolean, AuthorizationError>> {
    return okResult(true);
  }

  async areAuthorized(requests: AuthorizationRequest[]): Promise<AuthorizationResponse[]> {
    return requests.map((request) => ({ request, result: okResult(true) }));
  }
}
