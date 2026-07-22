import { Id } from '@src/common';
import { CreateGovernmentAgencyResponseDto } from './create-government-agency.response.dto';

export class CreateGovernmentAgencyMapper {
  // foundedAt/annualBudget come from the already-validated request body, not
  // from re-reading the row - the usecase only returns the new Id, so this
  // just echoes back what create() accepted rather than adding a DB round-trip.
  static mapSuccessResultToHttpResponse(
    id: Id,
    input: { foundedAt?: string; annualBudget?: string },
  ): { data: CreateGovernmentAgencyResponseDto } {
    const dto = new CreateGovernmentAgencyResponseDto();
    dto.id = id.toString();
    dto.foundedAt = input.foundedAt;
    dto.annualBudget = input.annualBudget;
    return { data: dto };
  }
}
