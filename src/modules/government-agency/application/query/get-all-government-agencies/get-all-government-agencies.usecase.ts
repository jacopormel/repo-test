import { CodedInfrastructureError, errorPagedResult, PagedResult, QueryDto } from '@src/common';
import { GovernmentAgencyDto } from '@src/modules/government-agency/application/dto/government-agency.dto';
import { GovernmentAgencyMappingError } from '@src/modules/government-agency/application/error/government-agency-mapping.error';
import { GovernmentAgencyQueryPort } from '@src/modules/government-agency/application/port/out/government-agency-query.port';
import { governmentAgencyFindByQueryDefinition } from './get-all-government-agencies.definition';

export class GetAllGovernmentAgenciesUsecase {
  constructor(private readonly governmentAgencyQueryPort: GovernmentAgencyQueryPort) {}

  async execute(
    query: QueryDto,
  ): Promise<
    PagedResult<GovernmentAgencyDto[], CodedInfrastructureError | GovernmentAgencyMappingError>
  > {
    query.validate(governmentAgencyFindByQueryDefinition);

    if (query.hasErrors()) {
      return errorPagedResult(query.getErrors());
    }

    return await this.governmentAgencyQueryPort.findAll(query);
  }
}
