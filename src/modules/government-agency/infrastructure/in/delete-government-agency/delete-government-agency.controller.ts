import { BadRequestException, Param } from '@nestjs/common';
import { ApiJsonApiController, ApiJsonApiDelete, ParseIdPipe } from '@pormeldev/axis-nestjs-common';
import { Id } from '@src/common';
import { DeleteGovernmentAgencyUsecase } from '@src/modules/government-agency/application/command/delete-government-agency/delete-government-agency.usecase';
import { mapGovernmentAgencyErrorsToHttpException } from '../common/government-agency-http-error.mapper';

@ApiJsonApiController('government-agencies')
export class DeleteGovernmentAgencyController {
  constructor(private readonly deleteGovernmentAgencyUsecase: DeleteGovernmentAgencyUsecase) {}

  @ApiJsonApiDelete('Soft-delete a government agency')
  async delete(@Param('id', ParseIdPipe) id: string): Promise<void> {
    const idResult = Id.fromString(id);
    if (!idResult.ok) {
      throw new BadRequestException(idResult.errors);
    }

    const result = await this.deleteGovernmentAgencyUsecase.execute(idResult.value);

    if (!result.ok) {
      throw mapGovernmentAgencyErrorsToHttpException(result.errors);
    }
  }
}
