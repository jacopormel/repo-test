import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateGovernmentAgencyUsecase } from './application/command/create-government-agency/create-government-agency.usecase';
import { DeleteGovernmentAgencyUsecase } from './application/command/delete-government-agency/delete-government-agency.usecase';
import { UpdateGovernmentAgencyUsecase } from './application/command/update-government-agency/update-government-agency.usecase';
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
    GovernmentAgencyQueryRepository,
    GovernmentAgencyRepository,
    {
      provide: GetAllGovernmentAgenciesUsecase,
      useFactory: (queryRepository: GovernmentAgencyQueryRepository) =>
        new GetAllGovernmentAgenciesUsecase(queryRepository),
      inject: [GovernmentAgencyQueryRepository],
    },
    {
      provide: CreateGovernmentAgencyUsecase,
      useFactory: (repository: GovernmentAgencyRepository) =>
        new CreateGovernmentAgencyUsecase(repository),
      inject: [GovernmentAgencyRepository],
    },
    {
      provide: UpdateGovernmentAgencyUsecase,
      useFactory: (repository: GovernmentAgencyRepository) =>
        new UpdateGovernmentAgencyUsecase(repository),
      inject: [GovernmentAgencyRepository],
    },
    {
      provide: DeleteGovernmentAgencyUsecase,
      useFactory: (repository: GovernmentAgencyRepository) =>
        new DeleteGovernmentAgencyUsecase(repository),
      inject: [GovernmentAgencyRepository],
    },
  ],
})
export class GovernmentAgencyModule {}
