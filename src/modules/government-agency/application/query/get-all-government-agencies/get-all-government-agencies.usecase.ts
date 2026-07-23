import {
  CacheInterface,
  CodedInfrastructureError,
  errorPagedResult,
  PagedResult,
  QueryDto,
} from '@src/common';
import { GovernmentAgencyDto } from '@src/modules/government-agency/application/dto/government-agency.dto';
import { GovernmentAgencyMappingError } from '@src/modules/government-agency/application/error/government-agency-mapping.error';
import { GovernmentAgencyQueryPort } from '@src/modules/government-agency/application/port/out/government-agency-query.port';
import { buildGovernmentAgencyListCacheKey } from '../../cache/government-agency-cache';
import { governmentAgencyFindByQueryDefinition } from './get-all-government-agencies.definition';

type GovernmentAgencyPagedResult = PagedResult<
  GovernmentAgencyDto[],
  CodedInfrastructureError | GovernmentAgencyMappingError
>;

export class GetAllGovernmentAgenciesUsecase {
  constructor(
    private readonly governmentAgencyQueryPort: GovernmentAgencyQueryPort,
    private readonly cache: CacheInterface,
  ) {}

  async execute(query: QueryDto): Promise<GovernmentAgencyPagedResult> {
    query.validate(governmentAgencyFindByQueryDefinition);

    if (query.hasErrors()) {
      return errorPagedResult(query.getErrors());
    }

    const cacheKey = buildGovernmentAgencyListCacheKey({
      filter: query.filter,
      sort: query.sort,
      page: query.page,
      fields: query.fields,
      include: query.include,
      timeZone: query.timeZone,
      withDeleted: query.withDeleted,
    });

    const cached = await this.cache.get<GovernmentAgencyPagedResult>(cacheKey);
    if (cached.ok && cached.value !== null) {
      return cached.value;
    }

    const result = await this.governmentAgencyQueryPort.findAll(query);
    if (result.ok) {
      await this.cache.set(cacheKey, result);
    }
    return result;
  }
}
