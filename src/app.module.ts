import { Global, Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { APP_GUARD, Reflector } from '@nestjs/core';

import {
  DbHealthPlugin,
  HEALTH_PLUGINS,
  HealthModule,
  OAUTH2ServerHealthPlugin,
  RedisHealthPlugin,
} from '@pormeldev/axis-module-health';

import {
  TransactionContextConfigurator,
  TypeOrmTransactionAdapter,
} from '@pormeldev/axis-service-database-typeorm';
import { configureTransactionContext } from './shared/config/transaction-context.config';
import {
  AxisNestJSCommonModule,
  SnakeToCamelInterceptor,
  LocalUserGuard,
} from '@pormeldev/axis-nestjs-common';
import { DataSourceType, UserModule } from '@pormeldev/axis-module-users';
import { AxisUser } from '@pormeldev/axis-common-lib';
import {
  AXIS_LOGGER,
  LoggerInterface,
  LogLevel,
} from '@pormeldev/axis-service-logger';
import { AXIS_CACHE, CacheInterface } from '@pormeldev/axis-service-cache';
import { RedisCacheService } from '@pormeldev/axis-service-cache-redis';
import { RedisCacheLogPublisher } from '@pormeldev/axis-logpublisher-edenor';
import {
  AuthorizationService,
  AXIS_AUTHORIZATION_SERVICE,
} from '@pormeldev/axis-service-authorization';
import { AWSVerifiedPermissionsAuthorizationService } from '@pormeldev/axis-service-authorization-awsvp';
import { AwsvpAuthorizationLogPublisher } from '@pormeldev/axis-logpublisher-edenor';
import {
  AxisLoggingModule,
  AxisLoggingContextMiddleware,
} from '@pormeldev/axis-module-logging-edenor';
import {
  readMasterConfigFromConfig,
  readSlavesConfigFromConfig,
  buildEngineSpecificOptionsFromConfig,
  buildBaseOrmConfig,
  shouldEnableReplication,
} from '@src/shared/config/db-config';
import { getMissingRequiredDatabaseEnvVars } from '@pormeldev/axis-service-database-typeorm';
import { getMissingRequiredEnvVars } from '@pormeldev/axis-nestjs-common';

const requiredAppEnvVars = [
  'APP_TITLE',
  'APP_DESCRIPTION',
  'APP_VERSION',
  'HEALTH_ERROR_STATUS_CODE',
  'HEALTH_OK_STATUS_CODE',
  'HEALTH_RUNNING_TEXT',
  'HEALTH_RUNNING_WITH_ERRORS_TEXT',
  'HEALTH_TIMEZONE',
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
  'AWVP_REGION',
  'AWVP_POLICY_STORE_ID',
  'AWVP_NAMESPACE',
];

const missingRequiredAppEnvVars = getMissingRequiredEnvVars(requiredAppEnvVars);
const missingRequiredDatabaseEnvVars = getMissingRequiredDatabaseEnvVars();
const missingRequiredEnvVars = [
  ...missingRequiredAppEnvVars,
  ...missingRequiredDatabaseEnvVars,
];
if (missingRequiredEnvVars.length > 0) {
  console.error('❌ MISSING REQUIRED ENVIRONMENT VARIABLES:');
  missingRequiredEnvVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Please add these variables to your .env file');
  process.exit(1);
}

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    AxisLoggingModule.register(
      {
        level: process.env.AXIS_LOG_LEVEL as unknown as LogLevel,
        timestamp: true as const,
        timeZone: process.env.AXIS_LOG_TZ as string,
        timestampName: process.env.AXIS_LOG_TS_NAME as string,
        prefix: true as const,
        prefixName: process.env.AXIS_LOG_PREFIX_NAME as string,
        prefixValue: process.env.AXIS_LOG_PREFIX_VALUE as string,
        format:
          (process.env.AXIS_LOG_FORMAT || 'json').toLowerCase() === 'text'
            ? 'text'
            : 'json',
        colors: (process.env.AXIS_LOG_COLORS || '').toLowerCase() === 'true',
      } as any,
      {
        target: process.env.AXIS_LOG_TARGET as string,
        integrationType: process.env.AXIS_LOG_INTEGRATION_TYPE as string,
        appName: process.env.AXIS_LOG_APP_NAME as string,
      },
    ),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, AXIS_LOGGER],
      useFactory: (cfg: ConfigService, appLogger: LoggerInterface) => {
        const type = cfg.get('DB_TYPE') as
          'postgres' | 'mssql' | 'oracle' | 'mysql' | 'mariadb';
        const typeormQueryLogs =
          (cfg.get('TYPEORM_QUERY_LOGS') || '').toLowerCase() === 'true';
        const slaveCount = parseInt(
          cfg.get<string>('DB_SLAVE_COUNT') as string,
        );

        const master = readMasterConfigFromConfig(cfg);
        const slaves = readSlavesConfigFromConfig(cfg, slaveCount);

        const baseConfig = buildBaseOrmConfig(
          type,
          typeormQueryLogs,
          appLogger,
          master.host,
          master.database,
        );
        const { enabled, defaultMode } = shouldEnableReplication(
          cfg,
          type,
          slaveCount,
        );

        let finalConfig: any = { ...baseConfig };
        if (enabled) {
          const replication: any = { master, slaves };
          if (defaultMode === 'master' || defaultMode === 'slave')
            replication.defaultMode = defaultMode;
          finalConfig.replication = replication;
        } else {
          finalConfig.host = master.host;
          finalConfig.port = master.port;
          finalConfig.username = master.username;
          finalConfig.password = master.password;
          finalConfig.database = master.database;
        }

        const engineSpecific = buildEngineSpecificOptionsFromConfig(cfg, type);
        return { ...finalConfig, ...engineSpecific };
      },
    }),

    AxisNestJSCommonModule.register({
      interceptors: [SnakeToCamelInterceptor],
      guards: [],
    }),
    UserModule.forRoot({
      dataSource: { type: DataSourceType.TYPEORM },
    }),
    HealthModule.register(
      {
        errorStatusCode: parseInt(
          process.env.HEALTH_ERROR_STATUS_CODE as string,
        ),
        okStatusCode: parseInt(process.env.HEALTH_OK_STATUS_CODE as string),
        runningText: process.env.HEALTH_RUNNING_TEXT as string,
        runningWithErrorsText: process.env
          .HEALTH_RUNNING_WITH_ERRORS_TEXT as string,
        timezone: process.env.HEALTH_TIMEZONE as string,
      },
      {
        provide: HEALTH_PLUGINS,
        useFactory: (dataSource: DataSource, cfg: ConfigService) => {
          const redisHost = cfg.get('REDIS_HOST') as string;
          const redisPort = parseInt(cfg.get('REDIS_PORT') as string);
          const redisTls =
            (cfg.get<string>('REDIS_TLS') || '').toLowerCase() === 'true';
          const redisTimeoutMs = parseInt(
            cfg.get<string>('REDIS_TIMEOUT_MS') as string,
          );

          const tenantId = cfg.get('OAUTH2SERVER_TENANT_ID') as string;
          const authorityHost = cfg.get<string>(
            'OAUTH2SERVER_AUTHORITY_HOST',
          ) as string;
          const oauthTimeoutMs = parseInt(
            cfg.get<string>('OAUTH2SERVER_TIMEOUT_MS') as string,
          );

          const plugins = [
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

          return plugins;
        },
        inject: [DataSource, ConfigService],
      },
    ),
  ],
  providers: [
    {
      provide: HEALTH_PLUGINS,
      useFactory: (dataSource: DataSource, cfg: ConfigService) => {
        const redisHost = cfg.get('REDIS_HOST') as string;
        const redisPort = parseInt(cfg.get('REDIS_PORT') as string);
        const redisTls =
          (cfg.get<string>('REDIS_TLS') || '').toLowerCase() === 'true';
        const redisTimeoutMs = parseInt(
          cfg.get<string>('REDIS_TIMEOUT_MS') as string,
        );

        const tenantId = cfg.get('OAUTH2SERVER_TENANT_ID') as string;
        const authorityHost = cfg.get<string>(
          'OAUTH2SERVER_AUTHORITY_HOST',
        ) as string;
        const oauthTimeoutMs = parseInt(
          cfg.get<string>('OAUTH2SERVER_TIMEOUT_MS') as string,
        );

        const plugins = [
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

        return plugins;
      },
      inject: [DataSource, ConfigService],
    },
    {
      provide: AXIS_AUTHORIZATION_SERVICE,
      useFactory: (
        cfg: ConfigService,
        appLogger: LoggerInterface,
      ): AuthorizationService => {
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
      },
      inject: [ConfigService, AXIS_LOGGER],
    },
    {
      provide: AXIS_CACHE,
      useFactory: async (
        cfg: ConfigService,
        appLogger: LoggerInterface,
      ): Promise<CacheInterface> => {
        const host = cfg.get<string>('REDIS_HOST') as string;
        const port = parseInt(cfg.get<string>('REDIS_PORT') as string);
        const tls =
          (cfg.get<string>('REDIS_TLS') || '').toLowerCase() === 'true';
        const namespace = cfg.get<string>('CACHE_NAMESPACE') as string;
        const ttl = parseInt(cfg.get<string>('REDIS_TTL') as string);
        const logger = new RedisCacheLogPublisher(appLogger, { host, port });
        const options: any = { host, port, tls, namespace, ttl, logger };
        return new RedisCacheService(options);
      },
      inject: [ConfigService, AXIS_LOGGER],
    },
    {
      provide: TypeOrmTransactionAdapter,
      useFactory: (ds: DataSource) =>
        new TypeOrmTransactionAdapter(
          ds,
          configureTransactionContext as TransactionContextConfigurator,
        ),
      inject: [DataSource],
    },
    {
      provide: APP_GUARD,
      useFactory: (dataSource: DataSource, reflector: Reflector) => {
        const emptyOnInsert = (_u: AxisUser, _id: number) => {};
        const emptyOnUpdate = (_u: AxisUser, _id: number) => {};
        return new LocalUserGuard(
          dataSource,
          reflector,
          emptyOnInsert,
          emptyOnUpdate,
        );
      },
      inject: [DataSource, Reflector],
    },
  ],
  exports: [TypeOrmTransactionAdapter, AXIS_CACHE, AXIS_AUTHORIZATION_SERVICE],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AxisLoggingContextMiddleware).forRoutes('*');
  }
}
