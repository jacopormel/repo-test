import 'reflect-metadata';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '@pormeldev/axis-nestjs-common';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidatorOptions } from 'class-validator';
import qs from 'qs';
import { AXIS_LOGGER, LoggerInterface } from '@pormeldev/axis-service-logger';
import { HttpRequestLogInterceptor } from '@pormeldev/axis-module-logging-edenor';
import { mapValidationErrorsToCodedInfrastructureErrors } from '@pormeldev/axis-nestjs-common';

export async function createAppInstance(): Promise<NestFastifyApplication> {
  const fastifyAdapter = new FastifyAdapter({
    routerOptions: {
      querystringParser: (str: string) => qs.parse(str, { allowDots: true }),
    },
  });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    { bodyParser: true },
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // Logging HTTP via interceptor
  const axisLogger = app.get<LoggerInterface>(AXIS_LOGGER as any);
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
        // Mapear errores de validación a CodedInfrastructureError
        const codedErrors =
          mapValidationErrorsToCodedInfrastructureErrors(errors);

        // Formatear para BadRequestException (mantiene compatibilidad con el filtro)
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
