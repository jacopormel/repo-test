import { PagedResult, QueryDto } from '@src/common';
import { GovernmentAgencyDto } from '@src/modules/government-agency/application/dto/government-agency.dto';
import { GovernmentAgencyMappingError } from '@src/modules/government-agency/application/error/government-agency-mapping.error';

export interface GovernmentAgencyQueryPort {
  findAll(
    query: QueryDto,
  ): Promise<PagedResult<GovernmentAgencyDto[], GovernmentAgencyMappingError>>;
}
