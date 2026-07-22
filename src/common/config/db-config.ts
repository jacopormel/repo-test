import { ConfigService } from '@nestjs/config';
import { TypeOrmAxisLogger } from '@pormeldev/axis-logpublisher-edenor';
import { LoggerInterface } from '@pormeldev/axis-service-logger';
import * as path from 'path';
import { DataSourceOptions } from 'typeorm';

export interface ConnectionConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

function assertEnvVar(value: string | undefined, varName: string): string {
  if (!value) {
    throw new Error(`Environment variable ${varName} is not defined`);
  }
  return value;
}

/** Config for the TypeORM CLI (migration:generate/run), read directly from process.env. */
export function buildBasicDataSourceOptionsFromEnv(): DataSourceOptions {
  const host = assertEnvVar(process.env.DB_MASTER_HOST, 'DB_MASTER_HOST');
  const port = parseInt(assertEnvVar(process.env.DB_MASTER_PORT, 'DB_MASTER_PORT'), 10);
  const username = assertEnvVar(process.env.DB_MASTER_USERNAME, 'DB_MASTER_USERNAME');
  const password = assertEnvVar(process.env.DB_MASTER_PASSWORD, 'DB_MASTER_PASSWORD');
  const database = assertEnvVar(process.env.DB_MASTER_DATABASE, 'DB_MASTER_DATABASE');

  return {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
  } satisfies DataSourceOptions;
}

export function readMasterConfigFromConfig(cfg: ConfigService): ConnectionConfig {
  return {
    host: assertEnvVar(cfg.get('DB_MASTER_HOST'), 'DB_MASTER_HOST'),
    port: parseInt(assertEnvVar(cfg.get('DB_MASTER_PORT'), 'DB_MASTER_PORT'), 10),
    username: assertEnvVar(cfg.get('DB_MASTER_USERNAME'), 'DB_MASTER_USERNAME'),
    password: assertEnvVar(cfg.get('DB_MASTER_PASSWORD'), 'DB_MASTER_PASSWORD'),
    database: assertEnvVar(cfg.get('DB_MASTER_DATABASE'), 'DB_MASTER_DATABASE'),
  };
}

export function readSlavesConfigFromConfig(
  cfg: ConfigService,
  slaveCount: number,
): ConnectionConfig[] {
  return Array.from({ length: slaveCount }).map((_, i) => ({
    host: assertEnvVar(cfg.get(`DB_SLAVE${i + 1}_HOST`), `DB_SLAVE${i + 1}_HOST`),
    port: parseInt(assertEnvVar(cfg.get(`DB_SLAVE${i + 1}_PORT`), `DB_SLAVE${i + 1}_PORT`), 10),
    username: assertEnvVar(cfg.get(`DB_SLAVE${i + 1}_USERNAME`), `DB_SLAVE${i + 1}_USERNAME`),
    password: assertEnvVar(cfg.get(`DB_SLAVE${i + 1}_PASSWORD`), `DB_SLAVE${i + 1}_PASSWORD`),
    database: assertEnvVar(cfg.get(`DB_SLAVE${i + 1}_DATABASE`), `DB_SLAVE${i + 1}_DATABASE`),
  }));
}

function getInt(val?: unknown): number | undefined {
  if (val === null || val === undefined) return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}

export function buildPostgresOptionsFromConfig(cfg: ConfigService): Record<string, unknown> {
  return {
    schema: cfg.get('POSTGRES_SCHEMA') || undefined,
    ssl:
      (cfg.get('POSTGRES_SSL') ?? 'false').toLowerCase() === 'true'
        ? cfg.get('POSTGRES_SSL_REJECT_UNAUTHORIZED')
          ? {
              rejectUnauthorized:
                (cfg.get('POSTGRES_SSL_REJECT_UNAUTHORIZED') as string).toLowerCase() === 'true',
            }
          : true
        : undefined,
    applicationName: cfg.get('POSTGRES_APP_NAME') || undefined,
    poolSize: getInt(cfg.get('POSTGRES_POOL_MAX')),
    extra: {
      max: getInt(cfg.get('POSTGRES_POOL_MAX')),
      idleTimeoutMillis: getInt(cfg.get('POSTGRES_POOL_IDLE_MS')),
    },
  };
}

export function buildBaseOrmConfig(
  typeormQueryLogs: boolean,
  appLogger: LoggerInterface,
  masterHost: string,
  masterDb: string,
) {
  const type = 'postgres' as const;
  const root = process.cwd();
  const isTsRuntime =
    !!process.env.TS_NODE ||
    !!process.env.TS_NODE_DEV ||
    !!process.env.JEST_WORKER_ID ||
    __filename.endsWith('.ts');

  const entities = isTsRuntime
    ? [path.join(root, 'src', '**', '*.entity.ts')]
    : [path.join(root, 'dist', '**', '*.entity.js')];

  const migrations = isTsRuntime
    ? [
        path.join(root, 'src', '**', 'migrations', '*.ts'),
        path.join(root, 'src', '**', 'migration', '*.ts'),
      ]
    : [
        path.join(root, 'dist', '**', 'migrations', '*.js'),
        path.join(root, 'dist', '**', 'migration', '*.js'),
      ];
  return {
    type,
    entities,
    synchronize: false,
    migrations,
    migrationsRun: true,
    migrationsTableName: 'migrations',
    maxQueryExecutionTime: 1,
    logging: typeormQueryLogs ? ['error', 'warn', 'query', 'log'] : ['error', 'warn'],
    logger: new TypeOrmAxisLogger(appLogger, {
      type,
      host: masterHost,
      database: masterDb,
    }),
  } as Record<string, unknown>;
}

export function shouldEnableReplication(cfg: ConfigService, slaveCount: number) {
  const enabled =
    (cfg.get('DB_REPLICATION_ENABLED') ?? 'false').toString().toLowerCase() === 'true';
  const defaultMode = (cfg.get('DB_REPLICATION_DEFAULT_MODE') ?? '').toString().toLowerCase();
  return { enabled: enabled && slaveCount > 0, defaultMode } as {
    enabled: boolean;
    defaultMode?: string;
  };
}
