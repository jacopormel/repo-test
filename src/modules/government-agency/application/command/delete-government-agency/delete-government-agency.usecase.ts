import { CodedDomainError, errorResult, Id, Result } from '@src/common';
import { GovernmentAgencyMappingError } from '../../error/government-agency-mapping.error';
import { GovernmentAgencyNotFoundError } from '../../error/government-agency-not-found.error';
import { GovernmentAgencyRepositoryPort } from '../../port/out/government-agency-repository.port';

export class DeleteGovernmentAgencyUsecase {
  constructor(private readonly governmentAgencyRepository: GovernmentAgencyRepositoryPort) {}

  async execute(
    id: string,
  ): Promise<
    Result<void, CodedDomainError | GovernmentAgencyMappingError | GovernmentAgencyNotFoundError>
  > {
    const idResult = Id.fromString(id);
    if (!idResult.ok) {
      return errorResult(idResult.errors);
    }

    const agencyResult = await this.governmentAgencyRepository.findById(idResult.value);
    if (!agencyResult.ok) {
      return errorResult(agencyResult.errors);
    }

    const agency = agencyResult.value;
    const markAsDeletedResult = agency.markAsDeleted();
    if (!markAsDeletedResult.ok) {
      return errorResult(markAsDeletedResult.errors);
    }

    return await this.governmentAgencyRepository.patch(agency);
  }
}
