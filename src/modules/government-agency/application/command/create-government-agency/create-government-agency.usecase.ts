import { CodedDomainError, errorResult, okResult, Result } from '@src/common';
import { GovernmentAgency } from '@src/modules/government-agency/domain/government-agency.aggregate';
import { GovernmentAgencyMappingError } from '../../error/government-agency-mapping.error';
import { GovernmentAgencyRepositoryPort } from '../../port/out/government-agency-repository.port';

export class CreateGovernmentAgencyUsecase {
  constructor(private readonly governmentAgencyRepository: GovernmentAgencyRepositoryPort) {}

  async execute(input: {
    name: string;
    status: string;
    foundedAt?: string;
    annualBudget?: string;
  }): Promise<Result<string, CodedDomainError | GovernmentAgencyMappingError>> {
    const agencyResult = GovernmentAgency.create(input);
    if (!agencyResult.ok) {
      return errorResult(agencyResult.errors);
    }

    const saveResult = await this.governmentAgencyRepository.save(agencyResult.value);
    if (!saveResult.ok) {
      return errorResult(saveResult.errors);
    }

    return okResult(saveResult.value.toString());
  }
}
