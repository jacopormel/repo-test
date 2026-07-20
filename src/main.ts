import 'dotenv/config';
import 'reflect-metadata';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { Decimal } from '@pormeldev/axis-common-lib';
import { createAppInstance } from './app.factory';

type PathItem = OpenAPIObject['paths'][string];

async function bootstrap() {
  Decimal.configure({
    defaultToStringDecimalPlaces: 3,
    precision: 25,
    rounding: 4,
  });

  const app = await createAppInstance();

  const config = new DocumentBuilder()
    .setTitle(process.env.APP_TITLE || 'API de Ejemplo')
    .setDescription(
      process.env.APP_DESCRIPTION ||
        'API REST que sirve como ejemplo de desarrollo sobre Pormel Axis',
    )
    .setVersion(process.env.APP_VERSION || '1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const validMethods: (keyof PathItem)[] = [
    'get',
    'post',
    'put',
    'delete',
    'patch',
    'options',
    'head',
    'trace',
  ];

  for (const pathKey in document.paths) {
    const pathItem = document.paths[pathKey];

    for (const method of validMethods) {
      const operation = pathItem[method];

      if (typeof operation === 'object' && operation && 'responses' in operation) {
        const op = operation;
        op.parameters = op.parameters || [];
        op.parameters.push({
          name: 'axis-user',
          in: 'header',
          required: false,
          description: 'Información del usuario autenticado en formato JSON',
          schema: {
            type: 'string',
            example:
              '{"id":"abc-123","identityProvider":"entraid","name":"Juan Pérez","email":"juan@ejemplo.com","roles":["admin"], "type":"HUMAN"}',
          },
        });
        op.parameters.push({
          name: 'axis-request-id',
          in: 'header',
          required: false,
          description:
            'Identificador de request para correlación (si no se envía, el backend genera uno)',
          schema: {
            type: 'string',
            example: '01J7ZQ5Q9Y9G7X5D1C3B2A4F6H',
          },
        });
        op.parameters.push({
          name: 'axis-source-system',
          in: 'header',
          required: false,
          description:
            'Sistema origen de la solicitud (ej.: Frontend CDI, Partner X) — si no se envía, se usa "Desconocido"',
          schema: {
            type: 'string',
            example: 'Frontend CDI',
          },
        });
      }
    }
  }

  SwaggerModule.setup('api-docs', app, document);
  await app.listen(Number(process.env.APP_PORT), '0.0.0.0');
}

bootstrap()
  .then(() => {
    console.info(`Server running on port ${process.env.APP_PORT}`);
    console.info(`Documentation Swagger http://0.0.0.0:${process.env.APP_PORT}/api-docs`);
  })
  .catch((error: unknown) => {
    console.error('❌ Failed to start application', error);
    process.exit(1);
  });
