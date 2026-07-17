import { Id, Result } from '@src/common';
import { GovernmentAgency } from '@src/modules/government-agency/domain/government-agency.aggregate';
import { GovernmentAgencyMappingError } from '../../error/government-agency-mapping.error';
import { GovernmentAgencyNotFoundError } from '../../error/government-agency-not-found.error';

export const GOVERNMENT_AGENCY_REPOSITORY_PORT = Symbol('GOVERNMENT_AGENCY_REPOSITORY_PORT');

export interface GovernmentAgencyRepositoryPort {
  save(domain: GovernmentAgency): Promise<Result<Id, GovernmentAgencyMappingError>>;

  patch(domain: GovernmentAgency): Promise<Result<void, GovernmentAgencyMappingError>>;

  findById(
    id: Id,
  ): Promise<
    Result<GovernmentAgency, GovernmentAgencyMappingError | GovernmentAgencyNotFoundError>
  >;
}
