import { ConfigService } from '@nestjs/config';
import {
  DbHealthPlugin,
  OAUTH2ServerHealthPlugin,
  RedisHealthPlugin,
} from '@pormeldev/axis-module-health';
import { DataSource } from 'typeorm';

export function createHealthPlugins(dataSource: DataSource, cfg: ConfigService) {
  const redisHost = cfg.get('REDIS_HOST') as string;
  const redisPort = parseInt(cfg.get('REDIS_PORT') as string);
  const redisTls = (cfg.get<string>('REDIS_TLS') || '').toLowerCase() === 'true';
  const redisTimeoutMs = parseInt(cfg.get<string>('REDIS_TIMEOUT_MS') as string);

  const tenantId = cfg.get('OAUTH2SERVER_TENANT_ID') as string;
  const authorityHost = cfg.get<string>('OAUTH2SERVER_AUTHORITY_HOST') as string;
  const oauthTimeoutMs = parseInt(cfg.get<string>('OAUTH2SERVER_TIMEOUT_MS') as string);

  return [
    new DbHealthPlugin(dataSource),
    new RedisHealthPlugin({
      host: redisHost,
      port: redisPort,
      tls: redisTls,
      timeoutMs: redisTimeoutMs,
    }),
    new OAUTH2ServerHealthPlugin({
      tenantId,
      authorityHost,
      timeoutMs: oauthTimeoutMs,
    }),
  ];
}
