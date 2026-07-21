import { CodedDomainError, errorResult, Id, Result } from '@src/common';
import { GovernmentAgency } from '@src/modules/government-agency/domain/government-agency.aggregate';
import { GovernmentAgencyMappingError } from '../../error/government-agency-mapping.error';
import { GovernmentAgencyRepositoryPort } from '../../port/out/government-agency-repository.port';

export class CreateGovernmentAgencyUsecase {
  constructor(private readonly governmentAgencyRepository: GovernmentAgencyRepositoryPort) {}

  async execute(input: {
    name: string;
    status: string;
  }): Promise<Result<Id, CodedDomainError | GovernmentAgencyMappingError>> {
    const agencyResult = GovernmentAgency.create(input);
    if (!agencyResult.ok) {
      return errorResult(agencyResult.errors);
    }

    return await this.governmentAgencyRepository.save(agencyResult.value);
  }
}
