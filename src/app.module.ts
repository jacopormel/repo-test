import { Global, MiddlewareConsumer, Module, NestModule, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AxisUser } from '@pormeldev/axis-common-lib';
import {
  AwsvpAuthorizationLogPublisher,
  RedisCacheLogPublisher,
} from '@pormeldev/axis-logpublisher-edenor';
import {
  DbHealthPlugin,
  HEALTH_PLUGINS,
  HealthModule,
  OAUTH2ServerHealthPlugin,
  RedisHealthPlugin,
} from '@pormeldev/axis-module-health';
import {
  AxisLoggingContextMiddleware,
  AxisLoggingModule,
} from '@pormeldev/axis-module-logging-edenor';
import { DataSourceType, UserModule } from '@pormeldev/axis-module-users';
import {
  AxisNestJSCommonModule,
  getMissingRequiredEnvVars,
  LocalUserGuard,
  SnakeToCamelInterceptor,
} from '@pormeldev/axis-nestjs-common';
import {
  AuthorizationService,
  AXIS_AUTHORIZATION_SERVICE,
} from '@pormeldev/axis-service-authorization';
import { AWSVerifiedPermissionsAuthorizationService } from '@pormeldev/axis-service-authorization-awsvp';
import { AXIS_CACHE, CacheInterface } from '@pormeldev/axis-service-cache';
import { RedisCacheService } from '@pormeldev/axis-service-cache-redis';
import {
  getMissingRequiredDatabaseEnvVars,
  TransactionContextConfigurator,
  TypeOrmTransactionAdapter,
} from '@pormeldev/axis-service-database-typeorm';
import { AXIS_LOGGER, LoggerInterface, LogLevel } from '@pormeldev/axis-service-logger';
import {
  buildBaseOrmConfig,
  buildPostgresOptionsFromConfig,
  readMasterConfigFromConfig,
  readSlavesConfigFromConfig,
  shouldEnableReplication,
} from '@src/common/config/db-config';
import { DataSource } from 'typeorm';
import { configureTransactionContext } from './common/config/transaction-context.config';
import { SeedService } from './common/seed/seed.service';
import { GovernmentAgencyModule } from './modules/government-agency/government-agency.module';

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
  'AWVP_REGION',
  'AWVP_POLICY_STORE_ID',
  'AWVP_NAMESPACE',
];

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
        format: (process.env.AXIS_LOG_FORMAT || 'json').toLowerCase() === 'text' ? 'text' : 'json',
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
        const typeormQueryLogs = (cfg.get('TYPEORM_QUERY_LOGS') || '').toLowerCase() === 'true';
        const slaveCount = parseInt(cfg.get<string>('DB_SLAVE_COUNT') as string);

        const master = readMasterConfigFromConfig(cfg);
        const slaves = readSlavesConfigFromConfig(cfg, slaveCount);

        const baseConfig = buildBaseOrmConfig(
          typeormQueryLogs,
          appLogger,
          master.host,
          master.database,
        );
        const { enabled, defaultMode } = shouldEnableReplication(cfg, slaveCount);

        const finalConfig: any = { ...baseConfig };
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

        const engineSpecific = buildPostgresOptionsFromConfig(cfg);
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
        errorStatusCode: parseInt(process.env.HEALTH_ERROR_STATUS_CODE as string),
        okStatusCode: parseInt(process.env.HEALTH_OK_STATUS_CODE as string),
        runningText: process.env.HEALTH_RUNNING_TEXT as string,
        runningWithErrorsText: process.env.HEALTH_RUNNING_WITH_ERRORS_TEXT as string,
        timezone: process.env.HEALTH_TIMEZONE as string,
      },
      {
        provide: HEALTH_PLUGINS,
        useFactory: (dataSource: DataSource, cfg: ConfigService) => {
          const redisHost = cfg.get('REDIS_HOST') as string;
          const redisPort = parseInt(cfg.get('REDIS_PORT') as string);
          const redisTls = (cfg.get<string>('REDIS_TLS') || '').toLowerCase() === 'true';
          const redisTimeoutMs = parseInt(cfg.get<string>('REDIS_TIMEOUT_MS') as string);

          const tenantId = cfg.get('OAUTH2SERVER_TENANT_ID') as string;
          const authorityHost = cfg.get<string>('OAUTH2SERVER_AUTHORITY_HOST') as string;
          const oauthTimeoutMs = parseInt(cfg.get<string>('OAUTH2SERVER_TIMEOUT_MS') as string);

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

    GovernmentAgencyModule,
  ],
  providers: [
    {
      provide: AXIS_AUTHORIZATION_SERVICE,
      useFactory: (cfg: ConfigService, appLogger: LoggerInterface): AuthorizationService => {
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
      useFactory: (cfg: ConfigService, appLogger: LoggerInterface): CacheInterface => {
        const host = cfg.get<string>('REDIS_HOST') as string;
        const port = parseInt(cfg.get<string>('REDIS_PORT') as string);
        const tls = (cfg.get<string>('REDIS_TLS') || '').toLowerCase() === 'true';
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
        // No-op: this template doesn't sync extra fields on local user insert/update.
        const emptyOnInsert = (_u: AxisUser, _id: number) => {};
        // No-op: this template doesn't sync extra fields on local user insert/update.
        const emptyOnUpdate = (_u: AxisUser, _id: number) => {};
        return new LocalUserGuard(dataSource, reflector, emptyOnInsert, emptyOnUpdate);
      },
      inject: [DataSource, Reflector],
    },
    SeedService,
  ],
  exports: [TypeOrmTransactionAdapter, AXIS_CACHE, AXIS_AUTHORIZATION_SERVICE],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    if ((process.env.RUN_SEEDS_ON_STARTUP || '').toLowerCase() !== 'true') {
      return;
    }

    const result = await this.seedService.runAllSeeds();
    if (!result.ok) {
      console.error('❌ Seed failed:', result.errors);
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AxisLoggingContextMiddleware).forRoutes('*');
  }
}
