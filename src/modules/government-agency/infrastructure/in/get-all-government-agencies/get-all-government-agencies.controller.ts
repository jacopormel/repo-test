import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import {
  ApiJsonApiController,
  ApiJsonApiFindByQuery,
  QueryDtoDecorator,
} from '@pormeldev/axis-nestjs-common';
import { QueryDto } from '@src/common';
import { CodedInfrastructureError } from '@src/common/infrastructure/error';
import { governmentAgencyFindByQueryDefinition } from '@src/modules/government-agency/application/query/get-all-government-agencies/get-all-government-agencies.definition';
import { GetAllGovernmentAgenciesUsecase } from '@src/modules/government-agency/application/query/get-all-government-agencies/get-all-government-agencies.usecase';
import { GovernmentAgencyResponseDto } from '../common/government-agency.response.dto';
import { GetAllGovernmentAgenciesMapper } from './get-all-government-agencies.mapper';

@ApiJsonApiController('government-agencies')
export class GetAllGovernmentAgenciesController {
  constructor(private readonly getAllGovernmentAgenciesUsecase: GetAllGovernmentAgenciesUsecase) {}

  @ApiJsonApiFindByQuery({
    responseDto: GovernmentAgencyResponseDto,
    summary: 'List all government agencies',
    apiType: 'government-agencies',
    notFoundErrorForEmptyResponse: false,
    ...governmentAgencyFindByQueryDefinition,
  })
  async getAll(@QueryDtoDecorator() query: QueryDto) {
    const result = await this.getAllGovernmentAgenciesUsecase.execute(query);

    if (!result.ok) {
      const isQueryValidationError = result.errors.every(
        (error) => error instanceof CodedInfrastructureError,
      );
      if (isQueryValidationError) {
        throw new BadRequestException(result.errors);
      }
      throw new InternalServerErrorException(result.errors);
    }

    return GetAllGovernmentAgenciesMapper.mapFindAllSuccessResultToHttpResponse(
      result.value,
      result.meta,
    );
  }
}
