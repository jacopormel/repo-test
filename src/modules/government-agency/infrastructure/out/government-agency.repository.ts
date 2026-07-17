import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '@pormeldev/axis-service-database-typeorm';
import { Id, Result } from '@src/common';
import { GovernmentAgency } from '@src/modules/government-agency/domain/government-agency.aggregate';
import { Repository } from 'typeorm';
import { GovernmentAgencyMappingError } from '../../application/error/government-agency-mapping.error';
import { GovernmentAgencyNotFoundError } from '../../application/error/government-agency-not-found.error';
import { GovernmentAgencyRepositoryPort } from '../../application/port/out/government-agency-repository.port';
import { GovernmentAgencyEntity } from './government-agency.entity';
import { GovernmentAgencyWriteMapper } from './government-agency-write.mapper';

export class GovernmentAgencyRepository
  extends BaseRepository<GovernmentAgencyEntity, GovernmentAgency, GovernmentAgencyMappingError, Id>
  implements GovernmentAgencyRepositoryPort
{
  constructor(
    @InjectRepository(GovernmentAgencyEntity)
    repository: Repository<GovernmentAgencyEntity>,
  ) {
    super(repository, GovernmentAgencyEntity, 'government_agencies', []);
  }

  async save(domain: GovernmentAgency): Promise<Result<Id, GovernmentAgencyMappingError>> {
    return await super.create<Id>(
      domain,
      GovernmentAgencyWriteMapper.mapDomainToEntity,
      GovernmentAgencyWriteMapper.mapEntityToDomain,
      GovernmentAgencyMappingError,
    );
  }

  async patch(domain: GovernmentAgency): Promise<Result<void, GovernmentAgencyMappingError>> {
    return await super.update(
      domain.getId(),
      domain,
      GovernmentAgencyWriteMapper.mapDomainToEntity,
      GovernmentAgencyWriteMapper.mapEntityToDomain,
      GovernmentAgencyMappingError,
    );
  }

  async findById(
    id: Id,
  ): Promise<
    Result<GovernmentAgency, GovernmentAgencyMappingError | GovernmentAgencyNotFoundError>
  > {
    return await super.findById(
      id,
      false,
      GovernmentAgencyWriteMapper.mapEntityToDomain,
      GovernmentAgencyNotFoundError,
    );
  }
}
