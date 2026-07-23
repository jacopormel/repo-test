import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { injectDependency } from '@pormeldev/axis-nestjs-common';
import { AXIS_CACHE } from '@src/common';
import { AuthorizationGuard } from '@src/common/infrastructure/authorization/authorization.guard';
import { CreateGovernmentAgencyUsecase } from './application/command/create-government-agency/create-government-agency.usecase';
import { DeleteGovernmentAgencyUsecase } from './application/command/delete-government-agency/delete-government-agency.usecase';
import { UpdateGovernmentAgencyUsecase } from './application/command/update-government-agency/update-government-agency.usecase';
import { GOVERNMENT_AGENCY_QUERY_PORT } from './application/port/out/government-agency-query.port';
import { GOVERNMENT_AGENCY_REPOSITORY_PORT } from './application/port/out/government-agency-repository.port';
import { GetAllGovernmentAgenciesUsecase } from './application/query/get-all-government-agencies/get-all-government-agencies.usecase';
import { CreateGovernmentAgencyController } from './infrastructure/in/create-government-agency/create-government-agency.controller';
import { DeleteGovernmentAgencyController } from './infrastructure/in/delete-government-agency/delete-government-agency.controller';
import { GetAllGovernmentAgenciesController } from './infrastructure/in/get-all-government-agencies/get-all-government-agencies.controller';
import { UpdateGovernmentAgencyController } from './infrastructure/in/update-government-agency/update-government-agency.controller';
import { GovernmentAgencyEntity } from './infrastructure/out/government-agency.entity';
import { GovernmentAgencyQueryRepository } from './infrastructure/out/government-agency.query-repository';
import { GovernmentAgencyRepository } from './infrastructure/out/government-agency.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GovernmentAgencyEntity])],
  controllers: [
    GetAllGovernmentAgenciesController,
    CreateGovernmentAgencyController,
    UpdateGovernmentAgencyController,
    DeleteGovernmentAgencyController,
  ],
  providers: [
    AuthorizationGuard,
    {
      provide: GOVERNMENT_AGENCY_QUERY_PORT,
      useClass: GovernmentAgencyQueryRepository,
    },
    {
      provide: GOVERNMENT_AGENCY_REPOSITORY_PORT,
      useClass: GovernmentAgencyRepository,
    },
    injectDependency(GetAllGovernmentAgenciesUsecase, [GOVERNMENT_AGENCY_QUERY_PORT, AXIS_CACHE]),
    injectDependency(CreateGovernmentAgencyUsecase, [GOVERNMENT_AGENCY_REPOSITORY_PORT, AXIS_CACHE]),
    injectDependency(UpdateGovernmentAgencyUsecase, [GOVERNMENT_AGENCY_REPOSITORY_PORT, AXIS_CACHE]),
    injectDependency(DeleteGovernmentAgencyUsecase, [GOVERNMENT_AGENCY_REPOSITORY_PORT, AXIS_CACHE]),
  ],
})
export class GovernmentAgencyModule {}
