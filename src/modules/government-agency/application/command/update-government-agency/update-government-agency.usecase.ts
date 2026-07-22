import { CodedDomainError, errorResult, Id, Result } from '@src/common';
import { GovernmentAgencyMappingError } from '../../error/government-agency-mapping.error';
import { GovernmentAgencyNotFoundError } from '../../error/government-agency-not-found.error';
import { GovernmentAgencyRepositoryPort } from '../../port/out/government-agency-repository.port';

export class UpdateGovernmentAgencyUsecase {
  constructor(private readonly governmentAgencyRepository: GovernmentAgencyRepositoryPort) {}

  async execute(
    id: string,
    input: { name?: string; status?: string; foundedAt?: string; annualBudget?: string },
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
    const updateResult = agency.update(input);
    if (!updateResult.ok) {
      return errorResult(updateResult.errors);
    }

    return await this.governmentAgencyRepository.patch(agency);
  }
}
