import { ConfigService } from '@nestjs/config';
import { AwsvpAuthorizationLogPublisher } from '@pormeldev/axis-logpublisher-edenor';
import { AuthorizationService } from '@pormeldev/axis-service-authorization';
import { AWSVerifiedPermissionsAuthorizationService } from '@pormeldev/axis-service-authorization-awsvp';
import { LoggerInterface } from '@pormeldev/axis-service-logger';
import { authorizationProvider } from '../../config/authorization-provider.config';
import { AllowAllAuthorizationService } from './allow-all-authorization.service';

export function createAuthorizationService(
  cfg: ConfigService,
  appLogger: LoggerInterface,
): AuthorizationService {
  if (authorizationProvider === 'allow-all') {
    appLogger.warn({
      message: 'AUTHORIZATION_PROVIDER=allow-all: every AuthorizationGuard check will pass.',
    });
    return new AllowAllAuthorizationService();
  }

  const region = cfg.get('AWVP_REGION') as string;
  const policyStoreId = cfg.get('AWVP_POLICY_STORE_ID') as string;
  const namespace = cfg.get('AWVP_NAMESPACE') as string;
  const logger = new AwsvpAuthorizationLogPublisher(appLogger, {
    region,
    policyStoreId,
  });
  return new AWSVerifiedPermissionsAuthorizationService({
    region,
    policyStoreId,
    namespace,
    logger,
  });
}
