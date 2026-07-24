import { getMissingRequiredEnvVars } from '@pormeldev/axis-nestjs-common';
import { getMissingRequiredDatabaseEnvVars } from '@pormeldev/axis-service-database-typeorm';
import { authorizationProvider } from './authorization-provider.config';

const requiredAppEnvVars = [
  'APP_PORT',
  'APP_TITLE',
  'APP_DESCRIPTION',
  'APP_VERSION',
  'HEALTH_ERROR_STATUS_CODE',
  'HEALTH_OK_STATUS_CODE',
  'HEALTH_RUNNING_TEXT',
  'HEALTH_RUNNING_WITH_ERRORS_TEXT',
  'HEALTH_TIMEZONE',
  'CORS_ORIGINS',
  'RUN_SEEDS_ON_STARTUP',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_TLS',
  'REDIS_TIMEOUT_MS',
  'OAUTH2SERVER_TENANT_ID',
  'OAUTH2SERVER_AUTHORITY_HOST',
  'OAUTH2SERVER_TIMEOUT_MS',
  'CACHE_NAMESPACE',
  'REDIS_TTL',
  'AXIS_LOG_LEVEL',
  'AXIS_LOG_TZ',
  'AXIS_LOG_TS_NAME',
  'AXIS_LOG_PREFIX_NAME',
  'AXIS_LOG_PREFIX_VALUE',
  'AXIS_LOG_FORMAT',
  'AXIS_LOG_COLORS',
  'AXIS_LOG_TARGET',
  'AXIS_LOG_INTEGRATION_TYPE',
  'AXIS_LOG_APP_NAME',
  ...(authorizationProvider === 'allow-all'
    ? []
    : ['AWVP_REGION', 'AWVP_POLICY_STORE_ID', 'AWVP_NAMESPACE']),
];

const ALLOW_ALL_PERMITTED_ENVS = ['development', 'test'];

/** Validates required env vars and provider/environment invariants at boot, exiting the process on failure. */
export function validateStartupEnvironment(): void {
  const missingRequiredAppEnvVars = getMissingRequiredEnvVars(requiredAppEnvVars);
  const missingRequiredDatabaseEnvVars = getMissingRequiredDatabaseEnvVars();
  const missingRequiredEnvVars = [...missingRequiredAppEnvVars, ...missingRequiredDatabaseEnvVars];
  if (missingRequiredEnvVars.length > 0) {
    console.error('❌ MISSING REQUIRED ENVIRONMENT VARIABLES:');
    missingRequiredEnvVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Please add these variables to your .env file');
    process.exit(1);
  }

  if (
    authorizationProvider === 'allow-all' &&
    !ALLOW_ALL_PERMITTED_ENVS.includes(process.env.NODE_ENV || '')
  ) {
    console.error(
      `❌ AUTHORIZATION_PROVIDER=allow-all is only allowed when NODE_ENV is one of: ${ALLOW_ALL_PERMITTED_ENVS.join(', ')}.`,
    );
    process.exit(1);
  }

  if (
    (process.env.RUN_SEEDS_ON_STARTUP || '').toLowerCase() === 'true' &&
    process.env.NODE_ENV === 'production'
  ) {
    console.error('❌ RUN_SEEDS_ON_STARTUP=true is not allowed when NODE_ENV=production.');
    process.exit(1);
  }
}
