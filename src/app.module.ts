import { Global, MiddlewareConsumer, Module, NestModule, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HEALTH_PLUGINS, HealthModule } from '@pormeldev/axis-module-health';
import {
  AxisLoggingContextMiddleware,
  AxisLoggingModule,
} from '@pormeldev/axis-module-logging-edenor';
import { DataSourceType, UserModule } from '@pormeldev/axis-module-users';
import { AxisNestJSCommonModule, SnakeToCamelInterceptor } from '@pormeldev/axis-nestjs-common';
import { AXIS_AUTHORIZATION_SERVICE } from '@pormeldev/axis-service-authorization';
import { AXIS_CACHE } from '@pormeldev/axis-service-cache';
import {
  TransactionContextConfigurator,
  TypeOrmTransactionAdapter,
} from '@pormeldev/axis-service-database-typeorm';
import { AXIS_LOGGER } from '@pormeldev/axis-service-logger';
import { DataSource } from 'typeorm';
import {
  buildAxisLoggerIntegrationOptions,
  buildAxisLoggerOptions,
} from './common/config/axis-logging.factory';
import { createCacheService } from './common/config/cache.factory';
import { createHealthPlugins } from './common/config/health-plugins.factory';
import { validateStartupEnvironment } from './common/config/startup-validation.config';
import { configureTransactionContext } from './common/config/transaction-context.config';
import { createTypeOrmConfig } from './common/config/typeorm-async.factory';
import { createAuthorizationService } from './common/infrastructure/authorization/authorization-service.factory';
import { createLocalUserGuard } from './common/infrastructure/authorization/local-user-guard.factory';
import { SeedService } from './common/seed/seed.service';
import { GovernmentAgencyModule } from './modules/government-agency/government-agency.module';

validateStartupEnvironment();

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    AxisLoggingModule.register(buildAxisLoggerOptions(), buildAxisLoggerIntegrationOptions()),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, AXIS_LOGGER],
      useFactory: createTypeOrmConfig,
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
        useFactory: createHealthPlugins,
        inject: [DataSource, ConfigService],
      },
    ),

    GovernmentAgencyModule,
  ],
  providers: [
    {
      provide: AXIS_AUTHORIZATION_SERVICE,
      useFactory: createAuthorizationService,
      inject: [ConfigService, AXIS_LOGGER],
    },
    {
      provide: AXIS_CACHE,
      useFactory: createCacheService,
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
      useFactory: createLocalUserGuard,
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
