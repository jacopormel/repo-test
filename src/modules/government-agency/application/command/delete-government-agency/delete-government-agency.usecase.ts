import { errorResult, Id, Result } from '@src/common';
import { GovernmentAgencyMappingError } from '../../error/government-agency-mapping.error';
import { GovernmentAgencyNotFoundError } from '../../error/government-agency-not-found.error';
import { GovernmentAgencyRepositoryPort } from '../../port/out/government-agency-repository.port';

export class DeleteGovernmentAgencyUsecase {
  constructor(private readonly governmentAgencyRepository: GovernmentAgencyRepositoryPort) {}

  async execute(
    id: Id,
  ): Promise<Result<void, GovernmentAgencyMappingError | GovernmentAgencyNotFoundError>> {
    const agencyResult = await this.governmentAgencyRepository.findById(id);
    if (!agencyResult.ok) {
      return errorResult(agencyResult.errors);
    }

    const agency = agencyResult.value;
    agency.markAsDeleted();

    return await this.governmentAgencyRepository.patch(agency);
  }
}
