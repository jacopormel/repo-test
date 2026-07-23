import { CacheInterface, CodedDomainError, errorResult, Id, Result } from '@src/common';
import { invalidateGovernmentAgencyListCache } from '../../cache/government-agency-cache';
import { GovernmentAgencyMappingError } from '../../error/government-agency-mapping.error';
import { GovernmentAgencyNotFoundError } from '../../error/government-agency-not-found.error';
import { GovernmentAgencyRepositoryPort } from '../../port/out/government-agency-repository.port';
import { UpdateGovernmentAgencyInput } from './update-government-agency.input';

export class UpdateGovernmentAgencyUsecase {
  constructor(
    private readonly governmentAgencyRepository: GovernmentAgencyRepositoryPort,
    private readonly cache: CacheInterface,
  ) {}

  async execute(
    id: string,
    input: UpdateGovernmentAgencyInput,
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

    const patchResult = await this.governmentAgencyRepository.patch(agency);
    if (patchResult.ok) {
      await invalidateGovernmentAgencyListCache(this.cache);
    }

    return patchResult;
  }
}
