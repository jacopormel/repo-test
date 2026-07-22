import { Param, UseGuards } from '@nestjs/common';
import { ApiJsonApiController, ApiJsonApiDelete, ParseIdPipe } from '@pormeldev/axis-nestjs-common';
import { AuthorizationGuard } from '@src/common/infrastructure/authorization/authorization.guard';
import { RequirePermission } from '@src/common/infrastructure/authorization/require-permission.decorator';
import { DeleteGovernmentAgencyUsecase } from '@src/modules/government-agency/application/command/delete-government-agency/delete-government-agency.usecase';
import { mapGovernmentAgencyErrorsToHttpException } from '../common/government-agency-http-error.mapper';

@ApiJsonApiController('government-agencies')
@UseGuards(AuthorizationGuard)
export class DeleteGovernmentAgencyController {
  constructor(private readonly deleteGovernmentAgencyUsecase: DeleteGovernmentAgencyUsecase) {}

  @ApiJsonApiDelete('Soft-delete a government agency')
  @RequirePermission('DeleteGovernmentAgency', 'GovernmentAgency')
  async delete(@Param('id', ParseIdPipe) id: string): Promise<void> {
    const result = await this.deleteGovernmentAgencyUsecase.execute(id);

    if (!result.ok) {
      throw mapGovernmentAgencyErrorsToHttpException(result.errors);
    }
  }
}
