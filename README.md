## Gubernamentales Backend Template

Plantilla para iniciar APIs REST gubernamentales basada en NestJS + Fastify e integrada con el ecosistema Axis (DDD, logging, health, cache, autorización y base de datos).

### Arquitectura base

Las features se crean dentro de `src/modules/<feature>` y mantienen los límites
`domain`, `application` e `infrastructure`. El shared kernel vive en `src/shared`:

```text
src/
|-- modules/
`-- shared/
    |-- domain/
    |   |-- aggregate/
    |   |-- entity/
    |   |-- error/
    |   |-- event/
    |   |-- policy/
    |   `-- value-object/primitive/
    |-- application/
    |   |-- command/
    |   |-- query/
    |   `-- port/{in,out}/
    `-- infrastructure/adapter/{in,out}/
```

`Entity`, `AggregateRoot` y `ValueObject` se reexportan desde
`@pormeldev/axis-ddd-core`; no hay implementaciones locales paralelas. Los VOs
primitivos disponibles son `StringValue`, `NumberValue`, `IntValue` y
`BooleanValue`. Los decimales, fechas e IDs usan directamente `Decimal`,
`DateOnly`, `DateTime` e `Id` de `@pormeldev/axis-common-lib`.

```ts
import { StringValue } from '@src/shared';

export class OrganismName extends StringValue {}
```

### Versiones Axis

Las dependencias usan las versiones `latest` publicadas y completas. Al
17/07/2026 existen cuatro excepciones fijadas a la última versión utilizable:
`axis-module-users@2.0.1`, `axis-service-authorization@2.0.0`,
`axis-service-authorization-awsvp@2.0.0` y
`axis-service-database-typeorm@2.0.0`. Sus publicaciones `latest` declaran una
entrada en `dist/`, pero el tarball no contiene esos archivos. Verificar el
contenido del artefacto antes de subir estas versiones.

### Características

- Soporte de múltiples motores de base de datos con TypeORM: `postgres`, `mssql`, `oracle`, `mysql`, `mariadb`
- Replicación (master/slaves)
- Health checks para DB, Redis y OAuth2 Server
- Swagger/OpenAPI con título/descr./versión desde variables de entorno
- Logging estandarizado que sigue las normas de Edenor para monitoreo con correlación de requests
- Validación estricta de variables de entorno: si falta algo requerido, la app no arranca
- Debug listo para VS Code y suite de tests con Jest

## Requisitos

- Node.js 20+ (LTS recomendado)
- npm 9+
- Docker (opcional) para levantar Redis y la base de datos

## Inicio rápido

```bash
# 1) Instalar dependencias
npm install

# 2) Configurar variables de entorno
cp .env.example .env
# Todas las variables son OBLIGATORIAS y están documentadas en .env.example.  Modificar .env de acuerdo a tu ambiente

# 3) PostgreSQL es el motor predeterminado y su driver ya está instalado

# 4) Levantar DB/Redis con Docker Compose según el motor
docker compose -f docker-compose.postgres.yml up -d

# 5) Ejecutar en desarrollo (watch)
npm run start:dev

# Swagger UI
# http://localhost:3000/api-docs
```

## Variables de entorno

- La app valida las variables al arranque y aborta si falta alguna requerida.
- Copia `.env.example` a `.env` y completa según tu motor/entorno.

### Motores de base de datos y notas

- `mssql`: usa variables específicas prefijadas `MSSQL_` (pool, encrypt, trustServerCertificate, etc.)
- `postgres`: típicas de PG; pool y SSL según necesidad
- `mysql` / `mariadb`: mismas variables base, drivers `mysql2`
- `oracle`: puede configurarse con `ORACLE_CONNECT_STRING` o con `DB_MASTER_*` (host/port/service)
  - Si usas connect string, no se requieren `DB_MASTER_HOST/PORT/DATABASE`
  - En la imagen `gvenzl/oracle-xe` la PDB por defecto es `XEPDB1` (no `ORCLPDB1`)

### Replicación (slaves)

- Controlada por variables `DB_REPLICATION_ENABLED` y `DB_SLAVE_COUNT` + bloques `DB_SLAVE_{N}_*`.
- TypeORM soporta replicación en `postgres`, `mysql`, `mariadb`. En `mssql` y `oracle` no se recomienda/soporta del mismo modo.

## Docker Compose por motor (opcional)

Este repositorio incluye archivos separados para cada motor junto con Redis. Usa el que necesites:

```bash
# MSSQL Server
docker compose -f docker-compose.mssqlserver.yml up -d
docker compose -f docker-compose.mssqlserver.yml down

# PostgreSQL
docker compose -f docker-compose.postgres.yml up -d
docker compose -f docker-compose.postgres.yml down

# MySQL
docker compose -f docker-compose.mysql.yml up -d
docker compose -f docker-compose.mysql.yml down

# MariaDB
docker compose -f docker-compose.mariadb.yml up -d
docker compose -f docker-compose.mariadb.yml down

# Oracle XE
docker compose -f docker-compose.oracle.yml up -d
docker compose -f docker-compose.oracle.yml down
```

## Scripts (package.json)

```bash
# Desarrollo
npm run start           # arranque
npm run start:dev       # watch
npm run start:debug     # debug con inspector

# Build/Prod
npm run build
npm run start:prod      # node dist/main

# Pruebas
npm test
npm run test:watch
npm run test:cov
npm run test:e2e

# Lint/Format
npm run lint
npm run format

# Helpers para drivers de DB
npm run add:pg
npm run add:mysql
npm run add:mariadb
npm run add:mssql
npm run add:oracle
```

## Health checks

- Endpoint: `GET /health`
- Requiere header `axis-user` con un JSON válido.
- Plugins incluidos: DB, Redis, OAuth2 Server.
- Para Oracle, la sonda DB usa `SELECT 1 FROM DUAL`; para otros motores `SELECT 1`.

Ejemplo de invocación:

```bash
curl -s \
  -H 'axis-user: {"id":"abc-123","identityProvider":"entraid","name":"Juan Pérez","email":"juan@ejemplo.com","roles":["admin"], "type":"HUMAN"}' \
  http://localhost:3000/health
```

## Swagger

- UI: `/api-docs`
- Usa `APP_TITLE`, `APP_DESCRIPTION`, `APP_VERSION` desde el entorno

## Debugging (VS Code)

- Incluye `.vscode/launch.json`, `.vscode/tasks.json`, `.vscode/settings.json` y `nodemon.json` para una buena experiencia de depuración.
- Scripts útiles: `start:debug`, `test:debug`, `test:e2e:debug`.

## Testing

- Framework: Jest (`@nestjs/testing`, `ts-jest`).
- E2E: configuración en `test/jest-e2e.json`.
