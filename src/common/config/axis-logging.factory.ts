import { LoggerOptions, LogLevel } from '@pormeldev/axis-service-logger';

export function buildAxisLoggerOptions(): LoggerOptions {
  return {
    level: process.env.AXIS_LOG_LEVEL as unknown as LogLevel,
    timestamp: true as const,
    timeZone: process.env.AXIS_LOG_TZ as string,
    timestampName: process.env.AXIS_LOG_TS_NAME as string,
    prefix: true as const,
    prefixName: process.env.AXIS_LOG_PREFIX_NAME as string,
    prefixValue: process.env.AXIS_LOG_PREFIX_VALUE as string,
    format: (process.env.AXIS_LOG_FORMAT || 'json').toLowerCase() === 'text' ? 'text' : 'json',
    colors: (process.env.AXIS_LOG_COLORS || '').toLowerCase() === 'true',
  } as LoggerOptions;
}

export function buildAxisLoggerIntegrationOptions() {
  return {
    target: process.env.AXIS_LOG_TARGET as string,
    integrationType: process.env.AXIS_LOG_INTEGRATION_TYPE as string,
    appName: process.env.AXIS_LOG_APP_NAME as string,
  };
}
