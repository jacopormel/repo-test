import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { HttpRequestLogInterceptor } from '@pormeldev/axis-module-logging-edenor';
import {
  AllExceptionsFilter,
  mapValidationErrorsToCodedInfrastructureErrors,
} from '@pormeldev/axis-nestjs-common';
import { AXIS_LOGGER, LoggerInterface } from '@pormeldev/axis-service-logger';
import { ValidatorOptions } from 'class-validator';
import qs from 'qs';
import { AppModule } from './app.module';
import { parseListOfAllowedOrigins } from './common/config/cors.config';

export async function createAppInstance(): Promise<NestFastifyApplication> {
  const fastifyAdapter = new FastifyAdapter({
    routerOptions: {
      querystringParser: (str: string) => qs.parse(str, { allowDots: true }),
    },
  });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, {
    bodyParser: true,
  });

  app.enableCors({
    origin: parseListOfAllowedOrigins(process.env.CORS_ORIGINS),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Axis-User',
      'Axis-Source-System',
      'Axis-Request-Id',
    ],
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  const axisLogger = app.get<LoggerInterface>(AXIS_LOGGER);
  app.useGlobalInterceptors(new HttpRequestLogInterceptor(axisLogger));

  const validatorOptions: ValidatorOptions = {
    validationError: {
      target: false,
      value: true,
    },
    stopAtFirstError: false,
  };

  app.useGlobalPipes(
    new ValidationPipe({
      ...validatorOptions,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const codedErrors = mapValidationErrorsToCodedInfrastructureErrors(errors);

        // Formatted to keep shape compatible with the existing global exception filter.
        const formattedErrors = codedErrors.map((error) => ({
          field: error.field,
          error: error.message,
          code: error.code,
          context: error.context,
        }));

        return new BadRequestException(formattedErrors);
      },
    }),
  );

  return app;
}
