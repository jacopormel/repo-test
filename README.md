## Gubernamentales Backend Template

Plantilla para iniciar APIs REST gubernamentales basada en NestJS + Fastify e integrada con el ecosistema Axis (DDD, logging, health, cache, autorización y base de datos).

### Arquitectura base

Las features se crean dentro de `src/modules/<feature>` y mantienen los límites
`domain`, `application` e `infrastructure`. El código compartido vive en
`src/common`, siguiendo la convención de los backends Edenor:

```text
src/
|-- modules/
`-- common/
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
primitivos disponibles son `StringValue`, `NumberValue`, `IntValue`,
`BooleanValue` y `EnumValue`. Los decimales, fechas e IDs usan directamente
`Decimal`, `DateOnly`, `DateTime` e `Id` de `@pormeldev/axis-common-lib`.

Los VOs primitivos son nullable por default (`T | null`) y rechazan
`undefined` siempre; un VO de dominio concreto que nunca puede estar vacío
(como `GovernmentAgencyName`/`GovernmentAgencyStatus`, columnas NOT NULL de
su tabla) opta explícitamente por lo contrario agregando su propio chequeo en
`validate()`. Ver `src/common/domain/value-object/primitive-value.ts` y
`government-agency-name.value.ts` para el patrón completo (`validate()`
valida, `create()` es el único que construye).

El código bajo `domain/` importa de `@src/common/domain` (no del barrel
completo `@src/common`), para que la capa quede explícita en el import;
`application/`/`infrastructure/` usan `@src/common`. Ningún archivo importa
`@pormeldev/*` directo salvo los wrappers en `common/domain/*`,
`common/application/*` y `common/infrastructure/*`.

Ejemplo real ya presente en el repo: `src/modules/government-agency/` implementa
un CRUD completo (`GET`/`POST`/`PATCH`/`DELETE /government-agencies`) siguiendo
el patrón hexagonal + CQRS de Axis, y sirve como referencia para features nuevas:

- **Domain**: aggregate `GovernmentAgency` con dos VOs requeridos
  (`GovernmentAgencyName`, mínimo 10 caracteres; `GovernmentAgencyStatus`, enum
  `ACTIVE`/`INACTIVE`), `create()`/`reconstitute()` + `Result`, y borrado lógico
  (`markAsDeleted()`/`deletedAt`).
- **Application**: `query/` (lectura, `BaseQueryRepository`) y `command/`
  (escritura, `BaseRepository`) separados; cada usecase vive en su propia carpeta
  con su definición de query o su lógica propia. DTOs realmente compartidos
  (como el read-model) van en `application/dto/`.
- **Infrastructure**: cada endpoint tiene su propia carpeta bajo
  `infrastructure/in/<endpoint>/`, con su **propio controller** (un
  `@ApiJsonApiController('government-agencies')` por archivo, no uno solo con
  todos los métodos), su request/response DTO y su mapper. NestJS permite
  registrar varios controllers con el mismo prefijo de ruta en un mismo
  módulo sin problema, siempre que los verbos/paths no choquen. Los DTOs y
  helpers compartidos por varios endpoints (ej. la respuesta de listado, el
  mapper de errores HTTP) van en `infrastructure/in/common/`. Usa los
  decoradores reales de `@pormeldev/axis-nestjs-common`
  (`@ApiJsonApiController`, `@ApiJsonApiFindByQuery`, `@ApiJsonApiCreate`,
  `@ApiJsonApiUpdate`, `@ApiJsonApiDelete`).
- **`internalId`**: cada entity puede tener una surrogate key autoincremental de
  uso exclusivamente interno (asociaciones/optimizaciones de persistencia) —
  vive solo en la entity TypeORM, nunca en el aggregate de dominio ni en
  ningún DTO/respuesta.

> Nota de implementación: las clases `Coded*Error` de `axis-common-lib` resetean
> su propio prototipo en el constructor (`Object.setPrototypeOf(this, EstaClase.prototype)`),
> lo que rompe `instanceof` contra subclases propias (ej. `GovernmentAgencyNotFoundError`).
> Para distinguir tipos de error en un controller, chequeá `instanceof` contra la
> clase base de Axis (`CodedApplicationNotFoundError`, `CodedDomainError`, etc.),
> no contra tu subclase.

> Nota de implementación: `sortableFields`/`filterableFields` en un
> `QueryValidationDefinition` (ver `get-all-government-agencies.definition.ts`)
> van en **camelCase** (`foundedAt`, no `founded_at`), aunque el resto de la API
> (body, `fields[...]`, la respuesta) sea snake_case. Estos dos puntualmente no
> pasan por ningún interceptor de casing — van directo al query builder de
> TypeORM, que resuelve contra el nombre de propiedad de la entity. Declararlos
> en snake_case compila y valida bien, pero cualquier filtro/orden sobre ese
> campo responde 500 recién en runtime. `selectableFields` sí tolera cualquiera
> de los dos casings (soporta snake_case y camelCase).

> Nota de implementación: el `GetAllGovernmentAgenciesUsecase` cachea su
> resultado en Redis (`AXIS_CACHE`, ver `government-agency-cache.ts`), invalidado
> por completo en cada write de `Create`/`Update`/`Delete`. Está acá como
> **patrón de referencia** para features futuras con un volumen de lectura real
> que lo justifique — `government-agencies` en sí no tiene ese volumen. No
> repliques el cache en un módulo nuevo solo porque este ejemplo lo tiene;
> evaluá primero si ese endpoint realmente lo necesita, dado que suma
> invalidación a mantener en cada usecase de escritura futuro.

### Versiones Axis

Las dependencias usan las versiones `latest` publicadas y completas. Al
17/07/2026 existen cuatro excepciones fijadas a la última versión utilizable:
`axis-module-users@2.0.1`, `axis-service-authorization@2.0.0`,
`axis-service-authorization-awsvp@2.0.0` y
`axis-service-database-typeorm@2.0.0`. Sus publicaciones `latest` declaran una
entrada en `dist/`, pero el tarball no contiene esos archivos. Verificar el
contenido del artefacto antes de subir estas versiones.

### Características

- Base de datos: PostgreSQL vía TypeORM (motor único de este proyecto)
- Replicación (master/slaves)
- Health checks para DB, Redis y OAuth2 Server
- Swagger/OpenAPI con título/descr./versión desde variables de entorno
- Logging estandarizado que sigue las normas de Edenor para monitoreo con correlación de requests
- Validación estricta de variables de entorno: si falta algo requerido, la app no arranca
- CORS configurado vía `CORS_ORIGINS` (whitelist por env, sin `*` abierto)
- Debug listo para VS Code y suite de tests con Jest

## Requisitos

- Node.js 24+ (LTS recomendado; ver `.nvmrc`)
- pnpm 10+ (el repo fija `packageManager` en `package.json`; con Corepack habilitado, `pnpm` ya resuelve la versión correcta)
- Docker (opcional) para levantar Postgres/Redis, o el stack completo incluida la API

## Inicio rápido

```bash
# 1) Instalar dependencias
pnpm install

# 2) Configurar variables de entorno
cp .env.example .env
# Todas las variables son OBLIGATORIAS y están documentadas en .env.example. Modificar .env de acuerdo a tu ambiente

# 3) Levantar Postgres/Redis con Docker Compose
docker compose up -d

# 4) Ejecutar en desarrollo (watch)
pnpm run start:dev

# Swagger UI
# http://localhost:3000/api-docs
```

### Acceso a `@pormeldev/*` (GitHub Packages)

Las dependencias del scope `@pormeldev` se resuelven contra GitHub Packages
(ver `.npmrc`). Con pnpm, el token de un `.npmrc` de proyecto **no se expande**
por seguridad (evita que un archivo commiteado filtre secretos); hay que
configurarlo en tu entorno antes de instalar:

```bash
# Opción A: variable de entorno + config de usuario (una sola vez)
pnpm config set "//npm.pkg.github.com/:_authToken" "$GITHUB_PAT"

# Opción B: agregar la misma línea del .npmrc del repo a tu ~/.npmrc de usuario
```

`GITHUB_PAT` requiere los scopes `read:packages` y `repo`.

## Variables de entorno

- La app valida las variables al arranque y aborta si falta alguna requerida.
- Copia `.env.example` a `.env` y completa según tu entorno.
- `DB_TYPE=postgres` es fijo: lo exige el validador de Axis al arrancar, no es un selector de motor en este proyecto.

### Replicación (slaves)

- Controlada por variables `DB_REPLICATION_ENABLED` y `DB_SLAVE_COUNT` + bloques `DB_SLAVE_{N}_*`.

### CORS

- `CORS_ORIGINS`: lista de orígenes permitidos separados por coma (ver `.env.example`).
- Configurado en `app.factory.ts` vía `app.enableCors(...)`: methods explícitos, headers `Axis-User`/`Axis-Source-System`/`Axis-Request-Id`, `credentials: true`.

## Autorización

- Autenticación: el header `axis-user` (JSON con el usuario) se confía tal cual llega — este servicio no valida tokens, se asume que algo delante (gateway/BFF) ya autenticó y arma ese header. `RequireUserGuard`/`LocalUserGuard` (globales, de `@pormeldev/axis-nestjs-common`) exigen que el header exista, no que sea válido.
- Autorización: `AuthorizationGuard` + `@RequirePermission(action, resourceType)` (`src/common/infrastructure/authorization/`), aplicado por controller (`@UseGuards(AuthorizationGuard)`) — no es un guard global, hay que agregarlo explícitamente en cada controller nuevo.
  - **Sin `@RequirePermission` ni `@OpenEndpoint` en un método, el guard rechaza la request con 403** (fail-closed, `ForbiddenException`). Al agregar un endpoint nuevo con `@UseGuards(AuthorizationGuard)`, hace falta agregar explícitamente `@RequirePermission` (o `@OpenEndpoint` si debe ser público) en cada método, o queda inaccesible.
- `AUTHORIZATION_PROVIDER`: `awsvp` (default en `.env.example` es `allow-all`) usa `AWSVerifiedPermissionsAuthorizationService` real (AWS Verified Permissions); `allow-all` otorga siempre acceso, sin llamar a AWS.
  - `allow-all` solo arranca si `NODE_ENV` es `development` o `test` — cualquier otro valor (incluido `staging`, o sin setear) aborta el proceso. Pensado para que roles/permisos se prueben contra AWS Verified Permissions real en cualquier ambiente que no sea desarrollo local.

## Migraciones (TypeORM CLI)

`src/common/config/data-source.ts` expone el `DataSource` que usa la CLI (fuera de la app de Nest, sin DI: lee `.env` directo). Migraciones nuevas quedan en `src/common/migration/`.

```bash
pnpm run migration:generate --name=NombreDeLaMigracion
pnpm run migration:create --name=NombreDeLaMigracion
pnpm run migration:run
pnpm run migration:revert
```

`migrationsRun: true` en el bootstrap corre las migraciones pendientes al arrancar la app; estos scripts son para generarlas/revertirlas manualmente en desarrollo.

## Seeds

`src/common/seed/` tiene el mismo patrón que `edenor-investment-backend`: un
`SeedService` genérico (`runSeed`/`runAllSeeds`, transaccional, con rollback si
falla) y seeds concretos en `src/common/seed/data/*.seed.ts` que implementan
`SeedInterface`. Cada seed es idempotente (chequea por ID fijo antes de
insertar), así que correrlo más de una vez no duplica datos.

- **Automático al arrancar**: si `RUN_SEEDS_ON_STARTUP=true` (default en
  `.env`/`.env.example`, pensado para desarrollo local), `AppModule.onModuleInit()`
  corre todos los seeds disponibles. Rechazado al arrancar si `NODE_ENV=production`
  (ver `app.module.ts`).
- **Manual**: `pnpm run seed:run` (usa `src/common/seed/seed.command.ts`, un
  contexto de Nest standalone fuera del ciclo de vida HTTP). También rechaza
  correr si `NODE_ENV=production` — independiente de `RUN_SEEDS_ON_STARTUP`,
  ya que este comando no lo consulta.

Agregar un seed nuevo: crear `src/common/seed/data/<nombre>.seed.ts`
implementando `SeedInterface`, y sumarlo al array que devuelve
`SeedService.getAllAvailableSeeds()`.

## Docker Compose

Este repositorio incluye un único `docker-compose.yml` con Postgres + Redis +
la API (servicio `api`, buildeado desde el `Dockerfile` del repo), con las
credenciales tomadas de `.env` (con defaults de desarrollo si no está seteado):

```bash
docker compose up -d
docker compose down
```

El build de la imagen necesita `GITHUB_PAT` en tu entorno (mismo token que usás
para instalar `@pormeldev/*`, ver sección de arriba) — se pasa como build
secret de Docker, nunca queda persistido en ninguna capa de la imagen. Dentro
de la red de compose, la API se conecta a Postgres/Redis por nombre de
servicio (`postgres`/`redis`), no por `localhost` — eso lo pisa el `docker-compose.yml`
vía `environment:` sin que tengas que tocar tu `.env` local.

## Scripts (package.json)

```bash
# Desarrollo
pnpm run start           # arranque
pnpm run start:dev       # watch
pnpm run start:debug     # debug con inspector

# Build/Prod
pnpm run build
pnpm run start:prod      # node dist/main

# Pruebas
pnpm test
pnpm run test:watch
pnpm run test:cov
pnpm run test:e2e

# Lint/Format (Biome)
pnpm run lint          # lint --write
pnpm run format        # format --write
pnpm run check          # lint + format + organize imports, sin escribir
pnpm run check:write    # ídem, aplicando fixes

# Migraciones y seeds
pnpm run migration:run
pnpm run seed:run
```

## Health checks

- Endpoint: `GET /health`
- Requiere header `axis-user` con un JSON válido.
- Plugins incluidos: DB, Redis, OAuth2 Server.

Ejemplo de invocación:

```bash
curl -s \
  -H 'axis-user: {"id":"abc-123","identityProvider":"entraid","name":"Juan Pérez","email":"juan@ejemplo.com","roles":["admin"], "type":"HUMAN"}' \
  http://localhost:3000/health
```

## Swagger

- UI: `/api-docs`
- Usa `APP_TITLE`, `APP_DESCRIPTION`, `APP_VERSION` desde el entorno
- Deshabilitado automáticamente cuando `NODE_ENV=production` (ver `main.ts`): no se registra el documento ni la ruta `/api-docs`, para no exponer públicamente el detalle de rutas/DTOs de la API en ese ambiente.

## Debugging (VS Code)

- Incluye `.vscode/launch.json`, `.vscode/tasks.json`, `.vscode/settings.json` y `nodemon.json` para una buena experiencia de depuración.
- Scripts útiles: `start:debug`, `test:debug`, `test:e2e:debug`.

## Testing

- Framework: Jest. Unit tests transpilados con `@swc/jest` (`jest.config.ts` +
  `.swcrc.test.json`, más rápido, sin type-check); e2e sigue con `ts-jest`
  (`jest-e2e.json`).
- Unit: specs `*.spec.ts` en una carpeta `__test__/` junto al código que testean
  (ej. `domain/value-object/__test__/mi-vo.value.spec.ts`), no sueltos al lado
  del archivo. Coincide con la convención real de `edenor-investment-backend` y
  `volcan-pae-backend`.
- E2E: configuración en `jest-e2e.json` (raíz del repo); specs `*.e2e-spec.ts` bajo `src/**/__test__/`.
