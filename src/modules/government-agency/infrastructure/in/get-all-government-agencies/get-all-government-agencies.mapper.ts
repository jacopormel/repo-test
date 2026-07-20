import type { PaginationMetadata } from '@pormeldev/axis-common-lib';
import { GovernmentAgencyDto } from '@src/modules/government-agency/application/dto/government-agency.dto';
import { GovernmentAgencyResponseDto } from '../common/government-agency.response.dto';

export class GetAllGovernmentAgenciesMapper {
  static mapFindAllSuccessResultToHttpResponse(
    agencies: GovernmentAgencyDto[],
    meta: PaginationMetadata,
  ): { data: GovernmentAgencyResponseDto[]; meta: PaginationMetadata } {
    const data = agencies.map((agency) => {
      const dto = new GovernmentAgencyResponseDto();
      dto.id = agency.id;
      dto.name = agency.name;
      dto.status = agency.status;
      return dto;
    });

    return { data, meta };
  }
}
