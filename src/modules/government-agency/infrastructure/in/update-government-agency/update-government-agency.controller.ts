import { BadRequestException, Body, Param } from '@nestjs/common';
import { ApiJsonApiController, ApiJsonApiUpdate, ParseIdPipe } from '@pormeldev/axis-nestjs-common';
import { Id } from '@src/common';
import { UpdateGovernmentAgencyUsecase } from '@src/modules/government-agency/application/command/update-government-agency/update-government-agency.usecase';
import { mapGovernmentAgencyErrorsToHttpException } from '../common/government-agency-http-error.mapper';
import { UpdateGovernmentAgencyRequestDto } from './update-government-agency.request.dto';

@ApiJsonApiController('government-agencies')
export class UpdateGovernmentAgencyController {
  constructor(private readonly updateGovernmentAgencyUsecase: UpdateGovernmentAgencyUsecase) {}

  @ApiJsonApiUpdate({
    updateRequestDto: UpdateGovernmentAgencyRequestDto,
    summary: 'Update a government agency name',
  })
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
    });

    if (!result.ok) {
      throw mapGovernmentAgencyErrorsToHttpException(result.errors);
    }
  }
}
