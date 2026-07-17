import { Id } from '@src/common';
import { CreateGovernmentAgencyResponseDto } from './create-government-agency.response.dto';

export class CreateGovernmentAgencyMapper {
  static mapSuccessResultToHttpResponse(id: Id): { data: CreateGovernmentAgencyResponseDto } {
    const dto = new CreateGovernmentAgencyResponseDto();
    dto.id = id.toString();
    return { data: dto };
  }
}
