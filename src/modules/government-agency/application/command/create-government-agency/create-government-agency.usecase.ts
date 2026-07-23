import { CacheInterface, CodedDomainError, errorResult, okResult, Result } from '@src/common';
import { GovernmentAgency } from '@src/modules/government-agency/domain/government-agency.aggregate';
import { invalidateGovernmentAgencyListCache } from '../../cache/government-agency-cache';
import { GovernmentAgencyMappingError } from '../../error/government-agency-mapping.error';
import { GovernmentAgencyRepositoryPort } from '../../port/out/government-agency-repository.port';
import { CreateGovernmentAgencyInput } from './create-government-agency.input';

export class CreateGovernmentAgencyUsecase {
  constructor(
    private readonly governmentAgencyRepository: GovernmentAgencyRepositoryPort,
    private readonly cache: CacheInterface,
  ) {}

  async execute(
    input: CreateGovernmentAgencyInput,
  ): Promise<Result<string, CodedDomainError | GovernmentAgencyMappingError>> {
    const agencyResult = GovernmentAgency.create(input);
    if (!agencyResult.ok) {
      return errorResult(agencyResult.errors);
    }

    const saveResult = await this.governmentAgencyRepository.save(agencyResult.value);
    if (!saveResult.ok) {
      return errorResult(saveResult.errors);
    }

    await invalidateGovernmentAgencyListCache(this.cache);

    return okResult(saveResult.value.toString());
  }
}
