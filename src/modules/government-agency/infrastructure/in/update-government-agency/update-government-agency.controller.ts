import { BadRequestException, Body, Param, UseGuards } from '@nestjs/common';
import { ApiJsonApiController, ApiJsonApiUpdate, ParseIdPipe } from '@pormeldev/axis-nestjs-common';
import { Id } from '@src/common';
import { AuthorizationGuard } from '@src/common/infrastructure/authorization/authorization.guard';
import { RequirePermission } from '@src/common/infrastructure/authorization/require-permission.decorator';
import { UpdateGovernmentAgencyUsecase } from '@src/modules/government-agency/application/command/update-government-agency/update-government-agency.usecase';
import { mapGovernmentAgencyErrorsToHttpException } from '../common/government-agency-http-error.mapper';
import { UpdateGovernmentAgencyRequestDto } from './update-government-agency.request.dto';

@ApiJsonApiController('government-agencies')
@UseGuards(AuthorizationGuard)
export class UpdateGovernmentAgencyController {
  constructor(private readonly updateGovernmentAgencyUsecase: UpdateGovernmentAgencyUsecase) {}

  @ApiJsonApiUpdate({
    updateRequestDto: UpdateGovernmentAgencyRequestDto,
    summary: 'Update a government agency name',
  })
  @RequirePermission('UpdateGovernmentAgency', 'GovernmentAgency')
  async update(
    @Param('id', ParseIdPipe) id: string,
    @Body() body: UpdateGovernmentAgencyRequestDto,
  ): Promise<void> {
    const idResult = Id.fromString(id);
    if (!idResult.ok) {
      throw new BadRequestException(idResult.errors);
    }

    const result = await this.updateGovernmentAgencyUsecase.execute(idResult.value, {
      name: body.name,
      status: body.status,
      foundedAt: body.foundedAt,
      annualBudget: body.annualBudget,
    });

    if (!result.ok) {
      throw mapGovernmentAgencyErrorsToHttpException(result.errors);
    }
  }
}
