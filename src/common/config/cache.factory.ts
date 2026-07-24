import { ConfigService } from '@nestjs/config';
import { RedisCacheLogPublisher } from '@pormeldev/axis-logpublisher-edenor';
import { CacheInterface } from '@pormeldev/axis-service-cache';
import { RedisCacheService, type RedisOptions } from '@pormeldev/axis-service-cache-redis';
import { LoggerInterface } from '@pormeldev/axis-service-logger';

export function createCacheService(cfg: ConfigService, appLogger: LoggerInterface): CacheInterface {
  const host = cfg.get<string>('REDIS_HOST') as string;
  const port = parseInt(cfg.get<string>('REDIS_PORT') as string);
  const password = cfg.get<string>('REDIS_PASSWORD') || undefined;
  const tls = (cfg.get<string>('REDIS_TLS') || '').toLowerCase() === 'true';
  const namespace = cfg.get<string>('CACHE_NAMESPACE') as string;
  const ttl = parseInt(cfg.get<string>('REDIS_TTL') as string);
  const logger = new RedisCacheLogPublisher(appLogger, { host, port });
  const options: RedisOptions = { host, port, password, tls, namespace, ttl, logger };
  return new RedisCacheService(options);
}
