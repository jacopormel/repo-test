import { UseGuards } from '@nestjs/common';
import {
  ApiJsonApiController,
  ApiJsonApiFindByQuery,
  QueryDtoDecorator,
} from '@pormeldev/axis-nestjs-common';
import { QueryDto } from '@src/common';
import { AuthorizationGuard } from '@src/common/infrastructure/authorization/authorization.guard';
import { RequirePermission } from '@src/common/infrastructure/authorization/require-permission.decorator';
import { governmentAgencyFindByQueryDefinition } from '@src/modules/government-agency/application/query/get-all-government-agencies/get-all-government-agencies.definition';
import { GetAllGovernmentAgenciesUsecase } from '@src/modules/government-agency/application/query/get-all-government-agencies/get-all-government-agencies.usecase';
import { GovernmentAgencyResponseDto } from '../common/government-agency.response.dto';
import { mapGovernmentAgencyQueryErrorsToHttpException } from '../common/government-agency-http-error.mapper';
import { GetAllGovernmentAgenciesMapper } from './get-all-government-agencies.mapper';

@ApiJsonApiController('government-agencies')
@UseGuards(AuthorizationGuard)
export class GetAllGovernmentAgenciesController {
  constructor(private readonly getAllGovernmentAgenciesUsecase: GetAllGovernmentAgenciesUsecase) {}

  @ApiJsonApiFindByQuery({
    responseDto: GovernmentAgencyResponseDto,
    summary: 'List all government agencies',
    apiType: 'government-agencies',
    notFoundErrorForEmptyResponse: false,
    ...governmentAgencyFindByQueryDefinition,
  })
  @RequirePermission('ListGovernmentAgencies', 'GovernmentAgency')
  async getAll(@QueryDtoDecorator() query: QueryDto) {
    const result = await this.getAllGovernmentAgenciesUsecase.execute(query);

    if (!result.ok) {
      throw mapGovernmentAgencyQueryErrorsToHttpException(result.errors);
    }

    return GetAllGovernmentAgenciesMapper.mapFindAllSuccessResultToHttpResponse(
      result.value,
      result.meta,
    );
  }
}
