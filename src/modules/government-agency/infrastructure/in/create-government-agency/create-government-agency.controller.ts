import { Body, UseGuards } from '@nestjs/common';
import { ApiJsonApiController, ApiJsonApiCreate } from '@pormeldev/axis-nestjs-common';
import { AuthorizationGuard } from '@src/common/infrastructure/authorization/authorization.guard';
import { RequirePermission } from '@src/common/infrastructure/authorization/require-permission.decorator';
import { CreateGovernmentAgencyUsecase } from '@src/modules/government-agency/application/command/create-government-agency/create-government-agency.usecase';
import { mapGovernmentAgencyErrorsToHttpException } from '../common/government-agency-http-error.mapper';
import { CreateGovernmentAgencyMapper } from './create-government-agency.mapper';
import { CreateGovernmentAgencyRequestDto } from './create-government-agency.request.dto';
import { CreateGovernmentAgencyResponseDto } from './create-government-agency.response.dto';

@ApiJsonApiController('government-agencies')
@UseGuards(AuthorizationGuard)
export class CreateGovernmentAgencyController {
  constructor(private readonly createGovernmentAgencyUsecase: CreateGovernmentAgencyUsecase) {}

  @ApiJsonApiCreate({
    createRequestDto: CreateGovernmentAgencyRequestDto,
    summary: 'Create a government agency',
    apiType: 'government-agencies',
  })
  @RequirePermission('CreateGovernmentAgency', 'GovernmentAgency')
  async create(
    @Body() body: CreateGovernmentAgencyRequestDto,
  ): Promise<{ data: CreateGovernmentAgencyResponseDto }> {
    const result = await this.createGovernmentAgencyUsecase.execute({
      name: body.name,
      status: body.status,
      foundedAt: body.foundedAt,
      annualBudget: body.annualBudget,
    });

    if (!result.ok) {
      throw mapGovernmentAgencyErrorsToHttpException(result.errors);
    }

    return CreateGovernmentAgencyMapper.mapSuccessResultToHttpResponse(result.value, {
      foundedAt: body.foundedAt,
      annualBudget: body.annualBudget,
    });
  }
}
