import { Body } from '@nestjs/common';
import { ApiJsonApiController, ApiJsonApiCreate } from '@pormeldev/axis-nestjs-common';
import { CreateGovernmentAgencyUsecase } from '@src/modules/government-agency/application/command/create-government-agency/create-government-agency.usecase';
import { mapGovernmentAgencyErrorsToHttpException } from '../common/government-agency-http-error.mapper';
import { CreateGovernmentAgencyMapper } from './create-government-agency.mapper';
import { CreateGovernmentAgencyRequestDto } from './create-government-agency.request.dto';
import { CreateGovernmentAgencyResponseDto } from './create-government-agency.response.dto';

@ApiJsonApiController('government-agencies')
export class CreateGovernmentAgencyController {
  constructor(private readonly createGovernmentAgencyUsecase: CreateGovernmentAgencyUsecase) {}

  @ApiJsonApiCreate({
    createRequestDto: CreateGovernmentAgencyRequestDto,
    summary: 'Create a government agency',
    apiType: 'government-agencies',
  })
  async create(
    @Body() body: CreateGovernmentAgencyRequestDto,
  ): Promise<{ data: CreateGovernmentAgencyResponseDto }> {
    const result = await this.createGovernmentAgencyUsecase.execute({ name: body.name });

    if (!result.ok) {
      throw mapGovernmentAgencyErrorsToHttpException(result.errors);
    }

    return CreateGovernmentAgencyMapper.mapSuccessResultToHttpResponse(result.value);
  }
}
