import { PagedResult, QueryDto } from '@src/common';
import { GovernmentAgencyDto } from '@src/modules/government-agency/application/dto/government-agency.dto';
import { GovernmentAgencyMappingError } from '@src/modules/government-agency/application/error/government-agency-mapping.error';

export const GOVERNMENT_AGENCY_QUERY_PORT = Symbol('GOVERNMENT_AGENCY_QUERY_PORT');

export interface GovernmentAgencyQueryPort {
  findAll(
    query: QueryDto,
  ): Promise<PagedResult<GovernmentAgencyDto[], GovernmentAgencyMappingError>>;
}
