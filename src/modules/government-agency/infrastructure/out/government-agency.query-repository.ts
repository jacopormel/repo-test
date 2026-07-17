import { InjectRepository } from '@nestjs/typeorm';
import { BaseQueryRepository } from '@pormeldev/axis-service-database-typeorm';
import { PagedResult, QueryDto } from '@src/common';
import { Repository } from 'typeorm';
import { GovernmentAgencyDto } from '../../application/dto/government-agency.dto';
import { GovernmentAgencyMappingError } from '../../application/error/government-agency-mapping.error';
import { GovernmentAgencyQueryPort } from '../../application/port/out/government-agency-query.port';
import { GovernmentAgencyEntity } from './government-agency.entity';
import { GovernmentAgencyMapper } from './government-agency.mapper';

export class GovernmentAgencyQueryRepository
  extends BaseQueryRepository<
    GovernmentAgencyEntity,
    GovernmentAgencyDto,
    GovernmentAgencyMappingError
  >
  implements GovernmentAgencyQueryPort
{
  constructor(
    @InjectRepository(GovernmentAgencyEntity)
    repository: Repository<GovernmentAgencyEntity>,
  ) {
    super(repository);
  }

  findAll(
    query: QueryDto,
  ): Promise<PagedResult<GovernmentAgencyDto[], GovernmentAgencyMappingError>> {
    return super.findByQuery(query, (entity) => GovernmentAgencyMapper.mapEntityToDto(entity));
  }
}
