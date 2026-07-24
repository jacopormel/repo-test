import { ConfigService } from '@nestjs/config';
import { LoggerInterface } from '@pormeldev/axis-service-logger';
import {
  buildBaseOrmConfig,
  buildPostgresOptionsFromConfig,
  readMasterConfigFromConfig,
  readSlavesConfigFromConfig,
  shouldEnableReplication,
} from './db-config';

export function createTypeOrmConfig(cfg: ConfigService, appLogger: LoggerInterface) {
  const typeormQueryLogs = (cfg.get('TYPEORM_QUERY_LOGS') || '').toLowerCase() === 'true';
  const slaveCount = parseInt(cfg.get<string>('DB_SLAVE_COUNT') as string);

  const master = readMasterConfigFromConfig(cfg);
  const slaves = readSlavesConfigFromConfig(cfg, slaveCount);

  const baseConfig = buildBaseOrmConfig(typeormQueryLogs, appLogger, master.host, master.database);
  const { enabled, defaultMode } = shouldEnableReplication(cfg, slaveCount);

  const finalConfig: Record<string, unknown> = { ...baseConfig };
  if (enabled) {
    const replication: Record<string, unknown> = { master, slaves };
    if (defaultMode === 'master' || defaultMode === 'slave') replication.defaultMode = defaultMode;
    finalConfig.replication = replication;
  } else {
    finalConfig.host = master.host;
    finalConfig.port = master.port;
    finalConfig.username = master.username;
    finalConfig.password = master.password;
    finalConfig.database = master.database;
  }

  const engineSpecific = buildPostgresOptionsFromConfig(cfg);
  return { ...finalConfig, ...engineSpecific };
}
