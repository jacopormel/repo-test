import { DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { LoggerInterface } from '@pormeldev/axis-service-logger';
import { TypeOrmAxisLogger } from '@pormeldev/axis-logpublisher-edenor';
import * as path from 'path';

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

export function buildBasicDataSourceOptionsFromEnv(): DataSourceOptions {
  const type = assertEnvVar(process.env.DB_TYPE, 'DB_TYPE').toLowerCase();
  const host = assertEnvVar(process.env.DB_MASTER_HOST, 'DB_MASTER_HOST');
  const port = parseInt(
    assertEnvVar(process.env.DB_MASTER_PORT, 'DB_MASTER_PORT'),
    10,
  );
  const username = assertEnvVar(
    process.env.DB_MASTER_USERNAME,
    'DB_MASTER_USERNAME',
  );
  const password = assertEnvVar(
    process.env.DB_MASTER_PASSWORD,
    'DB_MASTER_PASSWORD',
  );
  const database = assertEnvVar(
    process.env.DB_MASTER_DATABASE,
    'DB_MASTER_DATABASE',
  );

  const base: any = { type, host, port, username, password, database };

  if (type === 'mssql') {
    base.options = { trustServerCertificate: true };
  }

  return base as DataSourceOptions;
}

export function readMasterConfigFromConfig(
  cfg: ConfigService,
): ConnectionConfig {
  return {
    host: assertEnvVar(cfg.get('DB_MASTER_HOST'), 'DB_MASTER_HOST'),
    port: parseInt(
      assertEnvVar(cfg.get('DB_MASTER_PORT'), 'DB_MASTER_PORT'),
      10,
    ),
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
    host: assertEnvVar(
      cfg.get(`DB_SLAVE${i + 1}_HOST`),
      `DB_SLAVE${i + 1}_HOST`,
    ),
    port: parseInt(
      assertEnvVar(cfg.get(`DB_SLAVE${i + 1}_PORT`), `DB_SLAVE${i + 1}_PORT`),
      10,
    ),
    username: assertEnvVar(
      cfg.get(`DB_SLAVE${i + 1}_USERNAME`),
      `DB_SLAVE${i + 1}_USERNAME`,
    ),
    password: assertEnvVar(
      cfg.get(`DB_SLAVE${i + 1}_PASSWORD`),
      `DB_SLAVE${i + 1}_PASSWORD`,
    ),
    database: assertEnvVar(
      cfg.get(`DB_SLAVE${i + 1}_DATABASE`),
      `DB_SLAVE${i + 1}_DATABASE`,
    ),
  }));
}

function getInt(val?: unknown): number | undefined {
  if (val === null || val === undefined) return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}

export function buildEngineSpecificOptionsFromConfig(
  cfg: ConfigService,
  type: string,
): any {
  const mssql = {
    options: {
      encrypt: (cfg.get('MSSQL_ENCRYPT') ?? 'false').toLowerCase() === 'true',
      useUTC: (cfg.get('MSSQL_USE_UTC') ?? 'true').toLowerCase() === 'true',
      trustServerCertificate:
        (cfg.get('MSSQL_TRUST_SERVER_CERT') ?? 'false').toLowerCase() ===
        'true',
      enableArithAbort:
        (cfg.get('MSSQL_ENABLE_ARITH_ABORT') ?? 'true').toLowerCase() ===
        'true',
    },
    requestTimeout: getInt(cfg.get('MSSQL_REQUEST_TIMEOUT_MS')),
    ...(() => {
      const max = getInt(cfg.get('MSSQL_POOL_MAX'));
      const minRaw = getInt(cfg.get('MSSQL_POOL_MIN'));
      const idle = getInt(cfg.get('MSSQL_POOL_IDLE_MS'));
      const min = minRaw !== undefined ? Math.max(0, minRaw) : undefined;
      if (max === undefined && min === undefined && idle === undefined)
        return {};
      const pool: any = {};
      if (max !== undefined) pool.max = max;
      if (min !== undefined) pool.min = min;
      if (idle !== undefined) pool.idleTimeoutMillis = idle;
      return { pool };
    })(),
  };

  const postgres = {
    schema: cfg.get('POSTGRES_SCHEMA') || undefined,
    ssl:
      (cfg.get('POSTGRES_SSL') ?? 'false').toLowerCase() === 'true'
        ? cfg.get('POSTGRES_SSL_REJECT_UNAUTHORIZED')
          ? {
              rejectUnauthorized:
                (
                  cfg.get('POSTGRES_SSL_REJECT_UNAUTHORIZED') as string
                ).toLowerCase() === 'true',
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

  const oracle = {
    connectString: cfg.get('ORACLE_CONNECT_STRING') || undefined,
    sid: cfg.get('ORACLE_SID') || undefined,
    serviceName: cfg.get('ORACLE_SERVICE_NAME') || undefined,
    externalAuth:
      (cfg.get('ORACLE_EXTERNAL_AUTH') ?? 'false').toLowerCase() === 'true' ||
      undefined,
    poolMin: getInt(cfg.get('ORACLE_POOL_MIN')),
    poolMax: getInt(cfg.get('ORACLE_POOL_MAX')),
    poolIncrement: getInt(cfg.get('ORACLE_POOL_INCREMENT')),
    poolTimeout: getInt(cfg.get('ORACLE_POOL_TIMEOUT')),
    stmtCacheSize: getInt(cfg.get('ORACLE_STMT_CACHE_SIZE')),
  };

  const mysql = {
    charset: cfg.get('MYSQL_CHARSET') || undefined,
    timezone: cfg.get('MYSQL_TIMEZONE') || undefined,
    extra: {
      multipleStatements:
        (cfg.get('MYSQL_MULTIPLE_STATEMENTS') ?? 'false').toLowerCase() ===
          'true' || undefined,
      decimalNumbers:
        (cfg.get('MYSQL_DECIMAL_NUMBERS') ?? 'false').toLowerCase() ===
          'true' || undefined,
    },
    ...(() => {
      const max = getInt(cfg.get('MYSQL_POOL_MAX'));
      const minRaw = getInt(cfg.get('MYSQL_POOL_MIN'));
      const min = minRaw !== undefined ? Math.max(0, minRaw) : undefined;
      if (max === undefined && min === undefined) return {};
      const pool: any = {};
      if (max !== undefined) pool.max = max;
      if (min !== undefined) pool.min = min;
      return { pool };
    })(),
  };

  const mariadb = {
    charset: cfg.get('MARIADB_CHARSET') || undefined,
    timezone: cfg.get('MARIADB_TIMEZONE') || undefined,
    extra: {
      ssl:
        (cfg.get('MARIADB_SSL') ?? 'false').toLowerCase() === 'true' ||
        undefined,
    },
    ...(() => {
      const max = getInt(cfg.get('MARIADB_POOL_MAX'));
      const minRaw = getInt(cfg.get('MARIADB_POOL_MIN'));
      const min = minRaw !== undefined ? Math.max(0, minRaw) : undefined;
      if (max === undefined && min === undefined) return {};
      const pool: any = {};
      if (max !== undefined) pool.max = max;
      if (min !== undefined) pool.min = min;
      return { pool };
    })(),
  };

  const map: Record<string, any> = { mssql, postgres, oracle, mysql, mariadb };
  return map[type] || {};
}

export function buildBaseOrmConfig(
  type: string,
  typeormQueryLogs: boolean,
  appLogger: LoggerInterface,
  masterHost: string,
  masterDb: string,
) {
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
    logging: typeormQueryLogs
      ? ['error', 'warn', 'query', 'log']
      : ['error', 'warn', 'query', 'log'],
    logger: new TypeOrmAxisLogger(appLogger, {
      type,
      host: masterHost,
      database: masterDb,
    }),
  } as any;
}

export function shouldEnableReplication(
  cfg: ConfigService,
  type: string,
  slaveCount: number,
) {
  const supported = [
    'mysql',
    'mariadb',
    'postgres',
    'mssql',
    'oracle',
  ].includes(type);
  const enabled =
    (cfg.get('DB_REPLICATION_ENABLED') ?? 'false').toString().toLowerCase() ===
    'true';
  const defaultMode = (cfg.get('DB_REPLICATION_DEFAULT_MODE') ?? '')
    .toString()
    .toLowerCase();
  return { enabled: supported && enabled && slaveCount > 0, defaultMode } as {
    enabled: boolean;
    defaultMode?: string;
  };
}
